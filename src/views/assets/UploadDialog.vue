<template>
  <v-layout justify-space-around column align-center>
    <v-card class="upload" :fullscreen="$vuetify.breakpoint.xs">
      <v-card-title class="application-title; justify-center">
        <h3>Select a Video or Image to Upload</h3>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-alert v-if="error" type="error" :value="error">{{error}}</v-alert>
        <file-pond
          name="libaryUpload"
          ref="pond"
          class-name="my-pond"
          label-idle="Drop file here or click to browse files"
          :allow-multiple="false"
          :instantUpload="false"
          :allow-revert="false"
          :imageTransformOutputQuality="95"
          :allowImageExifOrientation="true"
          accepted-file-types="image/jpeg, image/png, video/webm, video/mp4, video/mov, video/quicktime, application/pdf"
          :files="files"
          :beforeAddFile="beforeAddFile"
          @addfile="onaddfile"
          @removefile="onremovefile"
          @error="onError"
        />
        <div v-if="currentFile && !loading">
          <v-subheader>Asset Title</v-subheader>
          <v-text-field
            solo
            :label="`Name your ${currentFile.fileType.split('/')[0]}`"
            v-model="fileData.name"
            counter="100"
            maxLength="100"
          />
          <br>
          <v-textarea
            solo
            label="Please provide a short description"
            v-model="fileData.desc"
            counter="250"
            maxLength="250"
          ></v-textarea>
          <v-combobox
            solo
            persistent-hint
            label="Select relevant tags"
            v-model="fileData.tags"
            item-text="name"
            item-value="id"
            :items="assetMeta.allTags"
            chips
            deletable-chips
            multiple
            :return-object="true"
          />
          <v-card-actions class="justify-end">
            <v-btn :loading="loading" color="primary" @click="upload">Upload</v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
      <v-divider></v-divider>
        <v-card-actions class="justify-center">
        <v-btn :disabled="loading" color="primary" flat @click="done">Exit</v-btn>
        </v-card-actions>
        <div class="text-xs-center">
          <small>Exiting before Uploading will Cancel Action</small>
        </div>
    </v-card>
    <v-alert
      transition="slide-y-transition"
      type="success"
      :value="success">
        {{success}}
      </v-alert>
  </v-layout>
</template>

<script>

import path from 'ramda/src/path'
// import TermsAndConditions from '@/components/TermsAndConditions.vue'

import vueFilePond from 'vue-filepond'

import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImageResize from 'filepond-plugin-image-resize'
import FilePondPluginImageTransform from 'filepond-plugin-image-transform'
import FilePondPluginFilePoster from 'filepond-plugin-file-poster'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js'

// Import styles
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
import { Promise } from 'bluebird'

import { mapActions, mapGetters } from 'vuex'
import { ContentActions, ContentGetters } from '@/content/ContentStore'
import { createAsset } from '@/content/ContentService'
// import { rules } from '@/utils/Validation.js'

// Create FilePond component
const FilePond = vueFilePond(FilePondPluginImageTransform, FilePondPluginFileValidateType, FilePondPluginImagePreview, FilePondPluginFilePoster, FilePondPluginImageResize, FilePondPluginImageExifOrientation)

export default {
  name: 'UploadDialog',
  components: {
    FilePond
    // TermsAndConditions
  },
  mounted() {
    this.refreshMeta()
  },
  data() {
    return {
      error: null,
      loading: false,
      uploadDialog: false,
      fileData: {},
      files: [],
      currentFile: null,
      assetTypes: [],
      assetTags: [],
      thumbnail: null,
      assetSearch: {
        pageSize: 25,
        page: 1
      },
      success: null,
      assetId: null
      // rules
    }
  },
  computed: {
    ...mapGetters({
      assetMeta: ContentGetters.assetMeta
    })
  },
  methods: {
    ...mapActions({
      refreshMeta: ContentActions.REFRESH_ASSET_META,
      refreshLibrary: ContentActions.REFRESH_LIBRARY_ASSETS
    }),
    getTags() {

    },
    filtered(tags, filters) {
      return tags.filter(tag => filters.indexOf(tag.id) > -1)
    },
    // fieldName is the name of the input field
    // file is the actual file object to send
    async process(fieldName, file, metadata, load, error, progress, abort) {
      this.success = null
      this.assetId = null
      const { fileData, assetMeta } = this
      if (!fileData.name || !fileData.desc || !fileData.tags) {
        return error('Please fill out the whole form ')
      }

      let asset, tn
      try {
        const type = assetMeta.types.find(e => e.mimeType === file.type)
        if (!type) {
          console.warn('Unsupported type', { file, assetMeta })
          return error('Could not determine a supported file type for ' + file.type)
        }

        const [provider] = assetMeta.providers
        if (!provider) {
          console.warn('No known upload provider', { file, assetMeta })
          return error('Could not determine a supported upload destination. Please contact support')
        }

        // const profileAudience = assetMeta.audiences.find(_ => _.key === 'aud:profile')
        const anyTags = fileData.tags.map((fdMap, i) => {
          return fdMap.id
        })

        const payload = {
          typeId: type.id,
          tenantIntegrationId: provider.tenantIntegrationId,
          slug: new Date().getTime().toString(),
          name: fileData.name,
          description: fileData.desc,
          anyTags,
          public: false,
          ownerReadable: true
        }

        if (this.thumbnail && file.type.indexOf('video') === -1 && file.type.indexOf('pdf') === -1) {
          payload.thumbnail = {
            typeId: this.thumbnail.type.id,
            tenantIntegrationId: provider.tenantIntegrationId,
            slug: 'thumbnail_' + new Date().getTime().toString(),
            name: 'thumbnail_' + fileData.name,
            description: 'Thumbnail for ' + fileData.name,
            public: true,
            ownerReadable: false
          }
        }

        const result = await createAsset(payload)
        this.assetId = result.assetId
        asset = path(['destination'], result)
        tn = path(['thumbnail'], result)
      } catch (e) {
        console.warn('failed meta stuff', e)
        return error('We were unable to associate your upload correctly. Please contact support')
      }

      // THIS IS WHERE WE WANT TO SEND THE REQUEST TO THE S3 SIGNED URL
      if (tn && file.type.indexOf('video') === -1 && file.type.indexOf('pdf') === -1) {
        try {
          await this.sendSigned(this.thumbnail.file, tn)
        } catch (err) {
          console.warn('failed uploading thumbnail', err)
        }
      }
      const request = await this.sendSigned(file, asset, progress)

      // await this.$emit('uploaded', asset)
      await this.refreshLibrary(this.assetSearch)
      if (request.status >= 200 && request.status < 300) {
        // the load method accepts either a string (id) or an object
        load(request.responseText)
        this.done()
      } else {
        // Can call the error method if something is wrong, should exit after
        const err = new Error('Non 200 upload response returned')
        err.request = request
        error('Did not receive a valid upload response. Please contact support.')
      }

      // Should expose an abort method so the request can be cancelled
      return {
        abort: () => {
          // This function is entered if the user has tapped the cancel button
          request.abort()

          // Let FilePond know the request has been cancelled
          abort()
          this.error = 'Upload aborted'
        }
      }
    },
    async beforeAddFile(file) {
      const that = this
      that.thumbnail = null
      return new Promise((resolve, reject) => {
        if (file.fileType.indexOf('video') > -1) {
          const canvas = document.createElement('canvas')
          const video = document.createElement('video')
          video.type = file.type
          video.src = URL.createObjectURL(file.file)
          video.currentTime = 2
          video.onloadeddata = () => {
            const ratio = Math.min(500 / video.videoWidth, 500 / video.videoHeight)
            canvas.height = video.videoHeight * ratio
            canvas.width = video.videoWidth * ratio
            canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth * ratio, video.videoHeight * ratio)
            const thumbnail = canvas.toDataURL('image/png')
            file.setMetadata('poster', thumbnail)
            var blobBin = atob(thumbnail.split(',')[1])
            var array = []
            for (var i = 0; i < blobBin.length; i++) {
              array.push(blobBin.charCodeAt(i))
            }
            that.thumbnail = {
              type: that.assetMeta.types.find(e => e.mimeType === 'image/png'),
              file: new Blob([new Uint8Array(array)], { type: 'image/png' })
            }

            resolve(true)
          }
        } else {
          resolve(true)
        }
      })
    },
    async sendSigned(file, asset, progress) {
      const { destination } = asset
      const formData = new FormData()
      Object.keys(destination.fields)
        .map(f => {
          formData.append(f, destination.fields[f])
          return f + ' => ' + destination.fields[f]
        })
        .join('\n')
      formData.append('file', file, file.name)

      const request = new XMLHttpRequest()
      request.open('POST', destination.url)

      // Should call the progress method to update the progress to 100% before calling load
      // Setting computable to false switches the loading indicator to infinite mode
      if (progress) {
        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total)
        }
      }

      return new Promise((resolve) => {
        // Should call the load method when done and pass the returned server file id
        // this server file id is then used later on when reverting or restoring a file
        // so your server knows which file to return without exposing that info to the client
        request.onload = () => {
          resolve(request)
        }
        request.send(formData)
      })
    },
    async onaddfile(error, file) {
      if (error) {
        if (file && file.main && file.sub) {
          this.error = `${file.main}: ${file.sub}`
        } else {
          this.error = error.body
        }
      }
      if (this.currentFile || error) {
        return false
      }
      this.currentFile = file
      this.$set(this, 'fileData', {
        name: file.filename,
        desc: '',
        tags: [],
        type: null
      })
    },
    onError(error, file) {
      this.loading = false
      if (error) {
        if (file && file.main && file.sub) {
          this.error = `${file.main}: ${file.sub}`
        } else {
          this.error = error.body
        }
      }
    },
    onremovefile(file) {
      this.error = null
      this.currentFile = null
      this.fileData = null
    },
    async upload() {
      this.loading = true
      this.$refs.pond._pond.setOptions({
        server: {
          process: this.process
        }
      })
      this.error = null
      await this.$refs.pond.processFile()
      this.loading = false
    },
    async done(reason) {
      this.success = 'Uploaded Asset ' + this.assetId
      setTimeout(this.clearSuccess, 5000)
      this.error = null
      this.currentFile = null
      this.fileData = null
      this.$refs.pond.removeFile()
      this.thumbnail = null
      // this.$emit('assetsUploaded')
      await this.refreshLibrary(this.assetSearch)
      this.uploadDialog = false
    },
    clearSuccess() {
      this.success = null
    }
  }
}
</script>
<style scoped>
.upload {
  margin-top: 20px;
  width: 60%;
}
</style>
