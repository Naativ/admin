<template>
  <v-data-table
    class="elevation-1"
    expand
    :loading="loading"
    :items="sales"
    :headers="headers"
    item-key="saleId"
    :rows-per-page-items="[
      10,
      25,
      50,
      100,
      {
        text: '$vuetify.dataIterator.rowsPerPageAll',
        value: -1
      }
    ]"
  >
    <template slot="items" slot-scope="props">
      <tr @click="props.expanded = !props.expanded">
        <td class="text-xs">
          {{ props.item.awardedDate }}
          <v-text-field
            :key="`awardedDate${props.index}`"
            @click.stop
            :placeholder="`${props.item.awardedDate}`"
            v-if="editingArr[props.index]"
            v-model="sales[item].awardedDate"
          >
          </v-text-field>
        </td>
        <td class="text-xs">{{ props.item.orderId}}</td>
        <td class="text-xs">{{ lineItemsAmount(props.item.lineItems)}}</td>
        <td class="text-xs">
          {{ props.item.totalPoints }}
          <v-text-field
            @click.stop
            :placeholder="`${props.item.totalPoints}`"
            v-if="editingArr[props.index]"
          ></v-text-field>
        </td>
        <td class="text-xs">
          {{ props.item.commissionableAmount}}
          <v-text-field @click.stop :placeholder="`${props.item.commissionableAmount}`" v-if="editingArr[props.index]"></v-text-field>
        </td>
        <td class="text-xs">
          {{ props.item.commissionablePoints}}
          <v-text-field @click.stop :placeholder="`${props.item.commissionablePoints}`" v-if="editingArr[props.index]"></v-text-field>
        </td>
        <td class="text-xs">{{ props.item.displayName}}</td>
        <td class="text-xs">{{ props.item.sellerEmail}}</td>
        <td >
          <v-tooltip left :open-delay="500">
            <v-icon slot="activator" @click.stop="override(props)">
              {{ editingArr[props.index] ? 'cancel' : 'edit'}}
            </v-icon>
            <span>{{ editingArr[props.index] ? 'Cancel Override' : 'Override Order'}}</span>
          </v-tooltip>
          <v-tooltip top :open-delay="500">
            <v-icon slot="activator" @click.stop="reprocess(props)">
              autorenew
            </v-icon>
            <span>Reprocess Order</span>
          </v-tooltip>
        </td>
      </tr>
    </template>
    <template slot="expand" slot-scope="props">
      <div class="pa-3 sale-details">
        <v-container fluid>
          <v-layout>
            <v-flex xs4>
              <h4>Details:</h4>
              <ul>
                <li>Originating ID: {{props.item.providerOid}}</li>
                <li>Status: {{props.item.status}}</li>
                <li>Customer Note: {{props.item.customerNote}}</li>
              </ul>
            </v-flex>
            <v-flex xs4>
              <h4>Customer Info:</h4>
              <ul>
                <li>{{props.item.shippingFirstName}} {{props.item.shippingLastName}}</li>
                <li>{{props.item.shippingAddress1}}</li>
                <li>{{props.item.shippingAddress2}}</li>
                <li>{{props.item.shippingCity}}, {{props.item.shippingState}} {{props.item.shippingZip}}</li>
              </ul>
            </v-flex>
            <v-flex xs4>
              <h4>Billing Info:</h4>
              <ul>
                <li>{{props.item.billingFirstName}} {{props.item.billingLastName}}</li>
                <li>{{props.item.billingAddress1}}</li>
                <li>{{props.item.billingAddress2}}</li>
                <li>{{props.item.billingCity}}, {{props.item.billingState}} {{props.item.billingZip}}</li>
                <li>{{props.item.billingEmail}}</li>
              </ul>
            </v-flex>
          </v-layout>
          <v-layout>
            <v-flex xs12>
              <h4>Line Items</h4>
              <ul>
                <li
                  v-for="line in props.item.lineItems"
                  :key="line.id"
                >{{line.name}} ({{line.total}})</li>
              </ul>
            </v-flex>
          </v-layout>
        </v-container>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'SalesDataTable',
  props: {
    sales: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      editingArr: [],
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Order ID', value: 'orderId' }, // actually providerOid
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Commissionable Total', value: 'comTotal' },
        { text: 'Commissionable Points', value: 'comPoints' },
        { text: 'Seller Name', value: 'displayName' },
        { text: 'Seller Email', value: 'contactEmail' },
        { text: 'Actions', value: null, sortable: false }
      ],
      overrideValuesArr: []
    }
  },
  methods: {
    lineItemsAmount(lineItems) {
      if (!lineItems) {
        lineItems = []
      }
      let totalAmount = lineItems.map(item => {
        return item.total
      })
      return totalAmount.reduce((a, b) => a + b, 0)
    },
    override(props) {
      this.$set(this.editingArr, `${props.index}`, !this.editingArr[props.index])
      // TODO this.$apollo.mutate({
      //   mutation: SALES_OVERRIDE,
      //   variables: {
      //     input: {
      //       TBD
      //     }
      //   }
      // })
    },
    reprocess(props) {
      // console.log('reprocess', props)
      // TODO this.$apollo.query({
      //   query: SALES_REPROCESS,
      //   variables: {
      //     input: {
      //     }
      //   }
      // })
    },
    textFieldInputHandle(props, e) {
      const { index, name } = props
      this.overrideValuesArr[index][name] = e
    }
  },
  watch: {
    sales: {
      handler: function() {
        const overrideValues = Array(this.sales.length).fill({
          awardedDate: null,
          totalAmount: null,
          commissionableAmount: null,
          commissionablePoints: null
        })
        overrideValues.forEach((orVal, i) => {
          this.$set(this.overrideValuesArr, i, orVal)
        })
      },
      deep: true
    }
  }
}
</script>
