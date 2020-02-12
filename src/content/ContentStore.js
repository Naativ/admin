import store from '@/store'
import moment from 'moment'
import * as Content from '@/content/ContentService'
import * as Mutations from '@/store.mutations'

export const ContentActions = {
  REFRESH_ASSET_META: 'content:RefreshAssetMeta',
  REFRESH_LIBRARY_ASSETS: 'content:RefreshLibraryAssets',
  UPDATE_ASSET: 'content:UpdateAsset',
  REMOVE_ASSET: 'content:RemoveAsset',
  ADD_ASSET_TAG: 'content:AddAssetTag'
}

export const ContentMutations = {
  SET_ONE: 'contentSetOne',
  SET: 'contentSet',
  UPDATE: 'contentUpdate',
  REMOVE: 'removeUpdate'
}

export const ContentGetters = {
  assetMeta: 'contentAssetMeta',
  libraryAssets: 'libraryAssets'
}

const META_DEFAULT = {
  fetching: false,
  approval: [],
  tags: [],
  audiences: [],
  types: [],
  refreshed: null,
  error: undefined
}
const ASSET_DEFAULT = {
  fetching: false,
  assets: [],
  page: 1,
  pageSize: 25,
  totalResults: 0,
  totalPages: 0,
  refreshed: null
}
const DEFAULT_STATE = {
  meta: {
    asset: { ...META_DEFAULT }
  },
  assets: {
    library: { ...ASSET_DEFAULT }
  }
}
export const ContentStore = {
  state: DEFAULT_STATE,
  mutations: {
    [ContentMutations.SET]: (state, [value, fn]) => fn(state, value),
    [ContentMutations.SET_ONE]: (state, { property, value }) =>
      (state[property] = value),
    [Mutations.INIT]: state => {
      Object.assign(state, DEFAULT_STATE)
    },
    [ContentMutations.REMOVE]: (state, asset) => {
      const { assets } = state.assets.library
      state.assets.library.assets = assets.filter(a => a.id !== asset.id)
    }
  },
  actions: {
    [ContentActions.ADD_ASSET_TAG]: async ({ commit, state }, { asset, tags }) => {
      await Content.setAssetTags(asset.id, tags)
    },
    [ContentActions.REFRESH_ASSET_META]: async ({ commit, state }) => {
      // reset state
      commit(ContentMutations.SET, [
        {
          ...state.meta.asset,
          fetching: true,
          error: null
        },
        (state, value) => Object.assign(state.meta.asset, value)
      ])

      const assetMeta = await Content.getAssetMeta()

      commit(ContentMutations.SET, [
        {
          ...META_DEFAULT,
          ...assetMeta,
          refreshed: moment().toISOString()
        },
        (state, value) => Object.assign(state.meta.asset, value)
      ])
    },
    [ContentActions.REFRESH_LIBRARY_ASSETS]: async ({
      dispatch,
      commit,
      state
    }, searchQuery) => {
      // reset state
      commit(ContentMutations.SET, [
        {
          ...state.assets.library,
          fetching: true,
          error: null
        },
        (state, value) => Object.assign(state.assets.library, value)
      ])

      const { jwt } = store.state
      let meta = state.meta.asset
      // load if meta not initialized
      if (!meta.refreshed) {
        await dispatch(ContentActions.REFRESH_ASSET_META)
      }

      const filter = {
        visibilityIds: [200, 201, 202, 203, 204],
        ...searchQuery
      }
      if (searchQuery.owners && searchQuery.owners.length === 0) {
        delete filter.owners
      }
      if (searchQuery.anyTags && searchQuery.anyTags.length === 0) {
        delete filter.anyTags
      }

      const libraryAssets = await Content.searchAssets(
        'library',
        { ...filter,
          includeThumbnails: false,
          includeSources: false
        },
        jwt
      )
      commit(ContentMutations.SET, [
        {
          ...ASSET_DEFAULT,
          ...libraryAssets,
          refreshed: moment().toISOString()
        },
        (state, value) => Object.assign(state.assets.library, value)
      ])
    },
    [ContentActions.UPDATE_ASSET]: async ({ commit, state }, asset) => {
      commit(ContentMutations.UPDATE, asset)
    },
    [ContentActions.REMOVE_ASSET]: async ({ commit, state }, asset) => {
      commit(ContentMutations.REMOVE, asset)
    }
  },
  getters: {
    [ContentGetters.assetMeta]: state => state.meta.asset,
    [ContentGetters.libraryAssets]: state => {
      return state.assets.library
    }
  }
}
