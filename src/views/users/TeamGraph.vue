<template>
  <div>
    <v-layout row justify-space-between style="margin-left: 12.5%; margin-right: 12.5%;">
      <v-flex xs3>
        <MonthSelector :year="year" :month="month" @date-changed="dateChanged"/>
      </v-flex>
      <v-flex xs5>
        <form @submit.prevent="search" autocomplete="off">
          <v-flex>
            <v-layout row>
              <v-flex>
                <v-text-field
                  v-model="searchTerm"
                  append-icon="search"
                  type="text"
                  name="searchTerm"
                  label="Enter name"
                  c-on:keyup.enter="search"
                  xs9
                  hint="Enter to Submit"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-flex>
        </form>
      </v-flex>
      <v-flex xs2>
        <v-select
          v-model="select"
          :items="graphOptions"
          item-text="option"
          label="Graph Type"
          return-object
        ></v-select>
      </v-flex>
    </v-layout>
    <div ref="graph"></div>
    <v-progress-linear v-if="loading" :indeterminate="true" color="grey"></v-progress-linear>
    <v-data-table :headers="tableColumns" :items="items" item-key="id" class="elevation-1" expand>
      <template slot="items" slot-scope="props">
        <tr @click="props.expanded = !props.expanded">
          <td>
            <a>Details</a>
          </td>
          <td>{{ props.item.date }}</td>
          <td>${{ props.item.total }}</td>
          <td>{{ props.item.totalPoints }}</td>
          <td>{{ props.item.commissionableAmount }}</td>
          <td>{{ props.item.commissionablePoints }}</td>
          <td>{{ props.item.displayName }}</td>
          <td>{{ props.item.sellerEmail }}</td>
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
  </div>
</template>

<script>
import MonthSelector from '@/components/MonthSelector'

import { initialize, updateHeightDepth, collapse,
  checkParentOfPinned } from './TeamGraph.d3.js'
// import { OLD_QUERY } from '@/graphql/GetTeam'
import searchSalesBySellerId from '@/graphql/searchSalesBySellerId.gql'
import SalesStats from '@/graphql/SalesStats.gql'
// import _ from 'lodash'
import moment from 'moment'
import { map } from 'ramda'
import * as d3 from 'd3'

export default {
  data () {
    return {
      searchTerm: '',
      graph: null,
      root: null,
      radialRoot: null,
      graphOptions: [
        { option: 'Horizontal Tree' },
        { option: 'Vertical Tree' },
        { option: 'Radial Tree' }
      ],
      select: { option: 'Vertical Tree' },
      graphType: 'VT',
      month: moment()
        .format('MM'),
      year: moment().format('YYYY'),
      startDate: moment()
        .startOf('month')
        .format('YYYY-MM-DD'),
      endDate: moment()
        .startOf('month')
        .format('YYYY-MM-DD'),
      tableColumns: [
        {
          text: 'Show Details',
          value: 'string',
          align: 'left',
          sortable: false
        },
        { text: 'Date', value: 'date' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Commissionable Total', value: 'comTotal' },
        { text: 'Commissionable Points', value: 'comPoints' },
        { text: 'Seller Name', value: 'displayName' },
        { text: 'Seller Email', value: 'contactEmail' }
      ],
      contextMenuOptions: {
        unPinMenu: {
          title: `UnPin Member`,
          action: this.pinMember
        },
        pinMenu: {
          title: `Pin Member`,
          action: this.pinMember
        },
        displaySales: {
          title: `Display Sales`,
          action: this.updateSales
        },
        collapseMenu: {
          title: `Collapse Team`,
          action: this.collapseTeam
        },
        expandMenu: {
          title: `Expand Team`,
          action: this.expandTeam
        },
        loadChildrenMenu: {
          title: `Load Team`,
          action: this.loadChildrenMenu
        },
        center: {
          title: `Center`,
          action: this.centerMember
        }
      },
      zoomControls: [
        {
          control: 'zoomIn',
          img: '/img/icons/zoomIn.png',
          action: this.zoom,
          data: { amount: 1.02 }
        },
        {
          control: 'zoomOut',
          img: '/img/icons/zoomOut.png',
          action: this.zoom,
          data: { amount: 0.98 }
        }],
      panControls: [
        {
          control: 'panLeft',
          img: '/img/icons/leftArrow.png',
          action: this.pan,
          translate: { x: -1, y: 0 },
          data: { x: 10, y: 0 }
        },
        {
          control: 'panUp',
          img: '/img/icons/upArrow.png',
          action: this.pan,
          translate: { x: 0, y: -1 },
          data: { x: 0, y: 10 }
        },
        {
          control: 'panDown',
          img: '/img/icons/downArrow.png',
          action: this.pan,
          translate: { x: 0, y: 1 },
          data: { x: 0, y: -10 }
        },
        {
          control: 'panRight',
          img: '/img/icons/rightArrow.png',
          action: this.pan,
          translate: { x: 1, y: 0 },
          data: { x: -10, y: 0 }
        }
      ],
      sales: [],
      pinned: null,
      fetchedData: {},
      memberDict: {},
      firstPin: true,
      memberId: null,
      sellerId: null,
      loading: false
    }
  },
  watch: {
    select (newSelection) {
      this.changeGraphType(newSelection)
    }
  },
  components: {
    MonthSelector
  },
  async mounted () {
    const cfg = {
      el: this.$refs.graph,
      clickNode: this.clickNode,
      root: this.root,
      contextMenuFunc: this.contextMenuFunc,
      ranks: this.ranks,
      getRoot: this.getRoot,
      setRoot: this.setRoot,
      getSearchTerm: this.getSearchTerm,
      getLoading: this.getLoading,
      zoomControls: this.zoomControls,
      panControls: this.panControls,
      getGraphType: this.getGraphType,
      setRadialRoot: this.setRadialRoot,
      getRadialRoot: this.getRadialRoot
    }
    this.loading = true
    this.memberId = ~~this.$route.params.id
    this.sellerId = this.memberId
    this.fetchedData = await this.fetchData({ memberId: this.memberId })
    this.graph = initialize(cfg, this.fetchedData)
    this.pin(this.root)
    this.loading = false
  },
  methods: {
    zoom ({ amount }) {
      this.graph.zoomInAndOut({ amount })
    },
    pan ({ x, y }) {
      this.graph.panAround({ x, y })
    },
    search () {
      this.updateGraph({ source: this.root })
    },
    dateChanged ({ date }) {
      this.startDate = moment(date).startOf('month').format('YYYY-MM-DD')
      this.endDate = moment(date).endOf('month').format('YYYY-MM-DD')
      this.refreshGraph()
    },
    changeGraphType ({ option }) {
      switch (option) {
        case 'Horizontal Tree':
          if (this.graphType !== 'HT') { this.graphType = 'HT' } else return
          break
        case 'Vertical Tree':
          if (this.graphType !== 'VT') { this.graphType = 'VT' } else return
          break
        case 'Radial Tree':
          if (this.graphType !== 'RT') { this.graphType = 'RT' } else return
          break
      }
      this.searchTerm = ''
      this.graph.changeGraphType(this.root, this.graphType)
      this.updateGraph({ center: true, updateHeight: true })
    },
    getGraphType () {
      return this.graphType
    },
    getRoot () {
      return this.root
    },
    setRoot (newRoot) {
      this.root = newRoot
    },
    getRadialRoot () {
      return this.radialRoot
    },
    setRadialRoot (newRoot) {
      this.radialRoot = newRoot
    },
    getSearchTerm () {
      return this.searchTerm === '' ? null : this.searchTerm.toLowerCase()
    },
    getLoading () {
      return this.loading
    },
    reloadGraph () {
      this.graph.loadGraph({ fetchedData: this.fetchedData, graphType: this.graphType })
      this.pin(this.root)
      this.centerMember(this.root, this.graphType)
    },
    updateGraph (updateOptions) {
      const updateInput = {
        source: this.root,
        pinned: this.pinned,
        firstPin: this.firstPin,
        graphType: this.graphType,
        ...updateOptions
      }
      this.graph.update(updateInput)
    },
    zoomOut () {
      this.graph.zoomInAndOut({ amount: 0.8 })
    },
    pin (node) {
      // To be implemented in the future

      // if (this.pinned !== node) {
      //         this.pinned = node
      //         this.updateSellerId(this.pinned.data.data.memberId)
      //       } else {
      //         this.firstPin = true
      //         this.pinned = null
      //         this.updateSellerId(null)
      //       }
      //       this.graph.updatePinned(this.pinned, this.firstPin)
      //       this.firstPin = !this.pinned

      this.pinned = null
    },
    clickNode (selected) {
      if (selected._children) {
        selected.children = selected._children
        selected._children = null
        if (this.graphType === 'RT') {
          this.radialRoot = selected
        }
        this.updateGraph({ source: selected, center: true, updateHeight: true })
      } else if (!checkParentOfPinned(selected, this.pinned)) {
        if (selected.children || (selected.data.id === this.radialRoot.data.id && this.graphType === 'RT')) {
          selected._children = selected.children
          selected.children = null
          if (this.graphType === 'RT' && selected.parent) {
            this.radialRoot = selected.parent
            this.updateGraph({ source: selected.parent, center: true, updateHeight: true })
          } else { this.updateGraph({ source: selected, center: true, updateHeight: true }) }
        } else {
          this.loadChildrenMenu(selected)
        }
      }
      // this.updateGraph({ source: selected, center: true, updateHeight: true })
    },
    centerMember (d) {
      this.graph.centerMember(d, this.graphType)
    },
    updateSales (d) {
      this.updateSellerId(d ? d.data.data.memberId : null)
    },
    updateSellerId (newId) {
      this.sellerId = newId
    },
    contextMenuFunc (data) {
      const menu = []
      menu.push(this.contextMenuOptions[`displaySales`])
      menu.push(this.contextMenuOptions[`center`])

      if (data.children) menu.push(this.contextMenuOptions[`collapseMenu`])
      else if (data._children) {
        menu.push(this.contextMenuOptions[`expandMenu`])
      } else if (data.data.data.frontLineSize > 0) {
        menu.push(this.contextMenuOptions[`loadChildrenMenu`])
      }

      return menu
    },
    pinMember (d) {
      this.pin(d)
    },
    collapseTeam (d) {
      if (d.children) {
        d._children = d.children
        d.children = null
      }
      this.updateGraph({ source: d, center: true })
    },
    expandTeam (d) {
      if (d._children) {
        d.children = d._children
        d._children = null
      }
      this.updateGraph({ source: d, center: true })
    },
    async loadChildrenMenu (d, i) {
      if (d.data.data.frontLineSize > 0 && !d.children && !d._children) {
        this.loading = true
        let newChild = await this.fetchData({ memberId: d.data.data.memberId })
        let newNode = d3.hierarchy(newChild, d => d.children)
        if (newNode.children) {
          newNode.children.forEach(child => { child.parent = d })

          d.children = [...newNode.children]
          d.data.children = [...newNode.data.children]

          updateHeightDepth(this.root, 0)

          d.children.forEach(collapse)
        } else { d.data.data.leaf = true }
        this.loading = false
      } else {
        d.data.data.leaf = true
      }
      if (this.graphType === 'RT') {
        this.radialRoot = d
      }

      this.updateGraph({ source: d, center: true, updateHeight: true })
    },
    async refreshGraph () {
      this.loading = true
      let memberIds = Object.keys(this.memberDict).map(Number)
      const { data: { saleStatsByDateRange } } = await this.$apollo.query({
        query: SalesStats,
        variables: {
          input: {
            sponsorIds: [],
            memberIds: memberIds,
            startDate: this.startDate,
            endDate: this.endDate,
            mode: 'YEAR_AND_MONTH_CUBED',
            sorts: [{ field: 'JOIN_DATE', direction: 'ASC' }]
          }
        }
      })
      await saleStatsByDateRange.forEach(member => {
        this.memberDict[member.memberId] = {
          memberId: member.memberId,
          sponsorId: member.sponsorId,
          displayName: member.displayName,
          profileUrl: member.profileUrl,
          teamSize: member.teamSize,
          frontLineSize: member.frontLineSize,
          totalPoints: member.stats[member.stats.length - 1].totalPoints,
          totalAmount: member.stats[member.stats.length - 1].totalAmount
          // _data: member
        }
      })
      this.refreshNode({ node: this.root, dataChild: false })
      this.updateGraph({ source: this.root, center: false })
      this.loading = false
    },
    refreshNode ({ node, dataChild }) {
      if (dataChild) {
        node.data = this.memberDict[node.id]
        return
      }
      node.data.data = this.memberDict[node.data.id]
      if (node.children) {
        node.children.forEach(child => {
          this.refreshNode({ node: child })
        })
      }
      if (node.data.children) {
        node.data.children.forEach(child => {
          this.refreshNode({ node: child, dataChild: true })
        })
      }
      if (node._children) {
        node._children.forEach(child => {
          this.refreshNode({ node: child })
        })
      }
    },
    async fetchData ({ memberId }) {
      const { data: { saleStatsByDateRange } } = await this.$apollo.query({
        query: SalesStats,
        variables: {
          input: {
            sponsorIds: [memberId],
            memberIds: [memberId],
            startDate: this.startDate,
            endDate: this.endDate,
            mode: 'YEAR_AND_MONTH_CUBED',
            sorts: [{ field: 'JOIN_DATE', direction: 'ASC' }]
          }
        }
      })
      if (saleStatsByDateRange) {
        const tempArr = []
        await saleStatsByDateRange.forEach(member => {
          this.memberDict[member.memberId] = {
            memberId: member.memberId,
            sponsorId: member.sponsorId,
            displayName: member.displayName,
            profileUrl: member.profileUrl,
            teamSize: member.teamSize,
            frontLineSize: member.frontLineSize,
            totalPoints: member.stats[member.stats.length - 1].totalPoints,
            totalAmount: member.stats[member.stats.length - 1].totalAmount
            // _data: member// As far as I know we don't need this
          }
          tempArr.push({
            memberId: member.memberId,
            sponsorId: member.memberId === memberId ? null : member.sponsorId,
            displayName: member.displayName,
            profileUrl: member.profileUrl,
            teamSize: member.teamSize,
            frontLineSize: member.frontLineSize,
            totalPoints: member.stats[member.stats.length - 1].totalPoints,
            totalAmount: member.stats[member.stats.length - 1].totalAmount
            // _data: member// As far as I know we don't need this
          })
        })

        let stratifiedObj = {}
        // Create a tree like structure from our data
        stratifiedObj = await d3.stratify()
          .id(d => d.memberId)
          .parentId(d => d.sponsorId)(tempArr)

        const { children } = stratifiedObj
        if (!children) return stratifiedObj

        // Alphabetically sort the teamMembers
        children.sort((a, b) => (a.data.displayName.toLowerCase() > b.data.displayName.toLowerCase()) ? 1 : ((b.data.displayName.toLowerCase() > a.data.displayName.toLowerCase()) ? -1 : 0))

        return stratifiedObj
      }
      return null
    }
  },
  computed: {
    items () {
      return map(sale => {
        return {
          ...sale,
          id: sale.saleId,
          date: moment(sale.awardedDate, 'YYYY-MM-DD').format('MM/DD/YYYY')
        }
      }, this.sales)
    },
    currentId: {
      get: function () {
        const id = this.$route.params.id
        return parseInt(id)
      },
      set: function () {
      }
    }
  },
  apollo: {
    sales: {
      query: searchSalesBySellerId,
      variables () {
        return {
          saleSearchInput: {
            tenantId: this.$store.state.user.principal.tenantId,
            startDate: this.startDate,
            endDate: this.endDate,
            query: null,
            sellerId: this.sellerId
          }
        }
      },
      error (err) {
        this.loading = false
        console.error({ err })
      },
      debounce: 500,
      update ({ searchSalesBySellerId }) {
        this.loading = false
        return searchSalesBySellerId
      }
    }
  }
}
</script>

<style>
.imgCircle {
  fill: #fafafa;
  stroke: #828282;
  stroke-width: 3px;
}
.rankCircle {
  fill: #fff;
  stroke: #828282;
  stroke-width: 2px;
}

.controlCircle {
  fill: black;
  opacity: 0.2;
}
.parentCircle {
  fill: #fafafa;
  stroke: #ccc;
  stroke-width: 2px;
}
.memberHighlight {
  fill: #feff00;
}

.node text {
  font: 12px sans-serif;
}

.infoRect {
  fill: #fafafa;
  stroke: #ccc;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}
svg {
  border: 2px solid #ccc;
}

.pinImage {
  height: 42px;
  width: 42px;
  position: fixed;
}

.d3-context-menu {
  position: absolute;
  display: none;
  background-color: #f2f2f2;
  border-radius: 4px;

  font-family: Arial, sans-serif;
  font-size: 14px;
  min-width: 150px;
  border: 1px solid #d4d4d4;

  z-index: 1200;
}

.d3-context-menu ul {
  list-style-type: none;
  margin: 4px 0px;
  padding: 0px;
  cursor: default;
}

.d3-context-menu ul li {
  padding: 4px 16px;
}

.d3-context-menu ul li:hover {
  background-color: #4677f8;
  color: #fefefe;
}
</style>
