import * as d3 from 'd3'
import contextMenu from 'd3-context-menu'
// Display Variables

let width = 1000
let height = 400
let imageRadius = 20
let duration = 750
let zoomDuration = 10
let radius = 150
let radiusRatio = 6.66

let svg, pinImage

let vueControls
let menuFunc
let pressed

let textPadding = 5
let textSize = 12

let inTransition = false
let zoomer, svgContainer

let radialTree = d3
  .tree()
  .size([360, radius])
  .separation(function(a, b) {
    return (a.parent === b.parent ? 1 : 2) / a.depth
  })

var zoom = d3
  .zoom()
  .scaleExtent([0.1, 3])
  .on('zoom', zoomed)

function zoomed() {
  svg.attr('transform', d3.event.transform)
}

function centerMember(source, graphType) {
  let x, y
  if (graphType === 'HT') {
    x = -source.y0 + width / 3
    y = -source.x0 + height / 2
  } else if (graphType === 'VT') {
    x = -source.x0 + width / 2
    y = -source.y0 + height / 2 - 20
  } else if (graphType === 'RT') {
    x = -project(source.x0, source.y0)[0] + width / 2
    y = -project(source.x0, source.y0)[1] + height / 2
  }
  zoomer
    .transition()
    .duration(duration)
    .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(1))
}

function zoomInAndOut({ amount }) {
  zoomer
    .transition()
    .duration(zoomDuration)
    .call(zoom.scaleBy, amount)
    .on('end', () => {
      if (pressed) zoomInAndOut({ amount })
    })
  // call(firstArg: function, remainingArgs: args for function)
}

function panAround({ x, y }) {
  zoomer
    .transition()
    .duration(zoomDuration)
    .call(zoom.translateBy, x, y)
    .on('end', () => {
      if (pressed) panAround({ x, y })
    })
  // call(firstArg: function, remainingArgs: args for function)
}

const initializerExported = (cfg, data) => {
  menuFunc = cfg.contextMenuFunc
  vueControls = cfg

  svgContainer = d3
    .select(cfg.el)
    .append(`svg`)
    .attr(`viewBox`, `0 0 ${width} ${height}`)
    .attr(`width`, `75%`)
    .style(`margin-left`, `12.5%`)
    .on(`contextmenu`, () => d3.event.preventDefault())

  zoomer = svgContainer
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .call(zoom)
    .on(`dblclick.zoom`, null)

  svg = svgContainer.append(`g`).attr(`id`, `graph`)

  // Append the image of the pin to the svg
  pinImage = svg
    .append(`image`)
    .attr(`class`, `pinImage`)
    .attr(`xlink:href`, `/img/icons/pin.svg`)
    .style(`opacity`, `0`)

  loadGraph({ fetchedData: data, graphType: vueControls.getGraphType() })
  const graphControl = {
    zoomInAndOut,
    panAround,
    update,
    updatePinned,
    loadGraph,
    centerMember,
    changeGraphType
  }

  return graphControl
}

let loadGraph = ({ fetchedData, graphType }) => {
  let root = d3.hierarchy(fetchedData, d => d.children)
  if (graphType === 'HT') {
    root.x0 = height / 2
    root.y0 = 0
  } else if (graphType === 'VT') {
    root.x0 = 0
    root.y0 = width / 2
  } else if (graphType === 'RT') {
    root.x0 = 0
    root.y0 = 0
  }

  // Collapse after the first level
  collapse(root)

  vueControls.setRoot(root)

  update({
    source: vueControls.getRoot(),
    center: true,
    graphType: graphType
  })
  zoomControls()
  panControls()
  createMemberDetails()
}

let changeGraphType = (root, graphType) => {
  if (graphType === 'HT') {
    root.x0 = height / 2
    root.y0 = 0
  } else if (graphType === 'VT') {
    root.x0 = 0
    root.y0 = width / 2
  } else if (graphType === 'RT') {
    root.x0 = 0
    root.y0 = 0
  }
  // Clear the graph so the new graph changes take effect
  svg
    .selectAll('g.node')
    .data([])
    .exit()
    .remove()

  collapse(root)
  vueControls.setRoot(root)
  if (graphType === 'RT') vueControls.setRadialRoot(root)
}

// ------------------- Updates ------------------------

function update({ source, pinned, firstPin, center, graphType, updateHeight }) {
  if (updateHeight) updateHeightDepth(graphType !== 'RT' ? vueControls.getRoot() : vueControls.getRadialRoot(), 0)

  const newHeight = Math.max(
    vueControls
      .getRoot()
      .descendants()
      .reverse().length *
      (3 * imageRadius),
    height
  )

  let treemap
  if (graphType !== 'RT') treemap = d3.tree().size([newHeight, width])
  else {
    const radialRoot = vueControls.getRadialRoot()
    const childrenRadius = radialRoot.children ? radialRoot.children.length * radiusRatio : 0
    treemap = radialTree.size([360, Math.max(radius, childrenRadius)])
  }// Assigns the x and y position for the nodes
  let treeData = treemap(
    graphType !== 'RT' ? vueControls.getRoot() : vueControls.getRadialRoot()
  )
  // Compute the new tree layout.
  let nodes = treeData.descendants()
  let links = treeData.descendants().slice(1)

  if (graphType !== 'RT') {
    nodes.forEach(function(d) {
      if (graphType === 'HT') {
        return (d.y = (d.depth * width) / 4)
      } else if (graphType === 'VT') {
        return (d.y = d.depth * 150)
      }
    })
  }

  // ****************** Nodes ***************************

  // Update the nodes...
  let node = svg.selectAll(`g.node`).data(nodes, d => d.data.data.memberId)

  updateNodes(source, node, graphType)

  // ****************** Links ***************************

  // Update the links...
  let link = svg.selectAll(`path.link`).data(links, function(d) {
    return d.data.data.memberId
  })

  updateLinks(source, link, graphType)

  updatePinned(pinned, firstPin, graphType)

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x
    d.y0 = d.y
  })
  if (center) centerMember(source, graphType)
}

function updateNodes(source, node, graphType) {
  // Enter any new nodes at the parent`s previous position.
  let nodeEnter = node
    .enter()
    .insert(`g`, `g`)
    .attr(`class`, `node`)
    .attr(`transform`, function(d) {
      if (graphType === 'HT') {
        return `translate(` + source.y0 + `,` + source.x0 + `)`
      } else if (graphType === 'VT') {
        return `translate(` + source.x0 + `,` + source.y0 + `)`
      } else if (graphType === 'RT') {
        return `translate(${project(source.x0, source.y0)})`
      }
    })
  if (graphType === 'RT') {
    nodeEnter.append('circle')
      .attr('r', imageRadius / 2)
      .attr('class', 'parentCircle')
      .attr('cx', -imageRadius)
      .attr('cy', -imageRadius)
      .attr('style', d => `display: ${d.data.id === vueControls.getRadialRoot().data.id && d.parent ? 'show' : 'none'}`)
      .on('click', (d, i) => {
        if (!inTransition && !vueControls.getLoading()) {
          vueControls.clickNode(d, i)
        }
      })
      .attr('cursor', 'pointer')
  }

  // add picture
  let defs = nodeEnter.append('defs')

  defs
    .append('clipPath')
    .attr('id', d => 'ImagePath')
    .append('circle')
    .attr('r', imageRadius)
    .attr('cx', 0)
    .attr('cy', 0)

  defs
    .append('clipPath')
    .attr('id', d => 'rankPath')
    .append('circle')
    .attr('r', imageRadius / 2)
    .attr('cx', imageRadius / 2)
    .attr('cy', imageRadius / 2)

  nodeEnter
    .append(`circle`)
    .attr(`class`, 'imgCircle')
    .attr(`r`, 1e-6)
    .style('fill', d => `#fff)`)

  nodeEnter
    .append('image')
    .attr('x', -imageRadius)
    .attr('y', -imageRadius)
    .attr('class', 'pic')
    .attr('width', 1e-6)
    .attr('height', 1e-6)
    .attr('xlink:href', d => d.data.data.profileUrl || '')
    .attr('clip-path', d => `url(#ImagePath)`)

  // Logo Circle's for the nodes
  // nodeEnter
  //   .append('circle')
  //   .attr('class', 'rankCircle')
  //   .attr('r', 1e-6)
  //   .attr('cx', imageRadius / 2 + 5)
  //   .attr('cy', imageRadius / 2 + 5)
  //   .style('fill', d => {
  //     // return vueControls.ranks[`${d.data.data.values.rank}`].color
  //     return 'blue'
  //   })

  // nodeEnter
  //   .append('image')
  //   .attr('class', 'rank')
  //   .attr('x', 0)
  //   .attr('y', 0)
  //   .attr('width', 1e-6)
  //   .attr('height', 1e-6)
  //   .attr('xlink:href', d => d.data.data.values.imageUrl || '')
  //   .attr('clip-path', 'url(#rankPath)')

  // Add Circle for the click actions
  nodeEnter
    .append('circle')
    .attr('class', `actionCircle`)
    .attr(`fill`, `rgba(0,0,0,0)`)
    .attr(`r`, 1e-6)
    .on('click', (d, i) => {
      if (!inTransition && !vueControls.getLoading()) {
        vueControls.clickNode(d, i)
      }
    })
    .on(`contextmenu`, (d, i) => {
      if (!inTransition && !vueControls.getLoading()) {
        contextMenu(menuFunc(d))(d, i)
      }
    })
    .on(`mouseover`, function(d) {
      const bbox = this.getBBox()
      const middleX = bbox.x + bbox.width
      const middleY = bbox.y - bbox.height

      // generate a conversion function
      var convert = makeAbsoluteContext(this, svgContainer.node())

      // use it to calculate the absolute center of the element
      var absoluteCenter = convert(middleX, middleY)
      updateMemberDetails(d, absoluteCenter)
    })
    .on(`mouseout`, function() {
      d3.select('g.infoContainer').attr(`display`, `none`)
    })

  let textGroup = nodeEnter
    .append(`g`)
    .attr(`class`, `textGroup`)
    .attr(`transform`, `translate(0, 35)`)

  textGroup
    .append(`rect`)
    .attr(`class`, 'memberHighlight')
    .attr(`display`, d => {
      return d.data.data.displayName.includes(vueControls.getSearchTerm())
        ? `show`
        : `none`
    })
    .attr(`height`, 12)
    .attr(`width`, 0)
    .attr('x', d =>
      graphType !== 'RT' ? 0 : d.x < 180 ? imageRadius * 2 : -(imageRadius * 2)
    )
    .attr(`y`, () => (graphType !== 'RT' ? -10 : -8))

  if (graphType === 'HT') {
    // Add labels for the nodes
    textGroup
      .append(`text`)
      .attr('class', `name`)
      .attr(`text-anchor`, d => `middle`)
      .text(d => d.data.data.displayName)
      .on('click', (d, i) => {
        if (!inTransition && !vueControls.getLoading()) {
          vueControls.clickNode(d, i)
        }
      })
      .attr('cursor', 'pointer')
  } else if (graphType === 'VT') {
    // Add labels for the nodes
    textGroup
      .append(`text`)
      .attr('class', `firstname`)
      .attr(`text-anchor`, d => `middle`)
      .text(d => d.data.data.displayName.split(' ')[0])
      .on('click', (d, i) => {
        if (!inTransition && !vueControls.getLoading()) {
          vueControls.clickNode(d, i)
        }
      })
      .attr('cursor', 'pointer')

    // Add labels for the nodes
    textGroup
      .append(`text`)
      .attr('class', `lastname`)
      .attr(`text-anchor`, d => `middle`)
      .attr('y', 12)
      .text(d => {
        const name = d.data.data.displayName.split(' ')
        return name[name.length - 1]
      })
      .on('click', (d, i) => {
        if (!inTransition && !vueControls.getLoading()) {
          vueControls.clickNode(d)
        }
      })
      .attr('cursor', 'pointer')
  } else if (graphType === 'RT') {
    textGroup.attr(
      'transform',
      d => `translate(0,0) rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`
    )
    textGroup
      .append('text')
      .attr('class', 'name')
      .attr('dy', '.31em')
      .text(d => d.data.data.displayName)
      .on('click', (d, i) => {
        if (!inTransition && !vueControls.getLoading()) {
          vueControls.clickNode(d, i)
        }
      })
      .attr('cursor', 'pointer')
  }

  nodeEnter.selectAll(`rect.memberHighlight`).attr('height', function() {
    return this.parentNode.getBBox().height
  })

  // createMemberDetails(nodeEnter)

  // UPDATE
  let nodeUpdate = nodeEnter.merge(node)

  inTransition = true
  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr(`transform`, d => {
      if (graphType === 'HT') {
        return `translate(` + d.y + `,` + d.x + `)`
      } else if (graphType === 'VT') {
        return `translate(` + d.x + `,` + d.y + `)`
      } else if (graphType === 'RT') {
        return `translate(${project(d.x, d.y)})`
      }
    })
    .on(`end`, () => {
      inTransition = false
      nodeUpdate
        .select('circle.actionCircle')
        .attr(`r`, imageRadius + 2)
        .attr(`cursor`, `pointer`)
    })
  // nodeUpdate
  //   .select(`text.name`)
  //   .attr(`text-anchor`, d => `middle`)
  //   .text(d => d.data.data.displayName)

  // Update the node attributes and style
  nodeUpdate.select(`circle.imgCircle`).attr(`r`, imageRadius + 1)

  nodeUpdate.select('circle.parentCircle')
    .attr('style', d => `display: ${d.data.id === vueControls.getRadialRoot().data.id && d.parent ? 'show' : 'none'}`)
  // nodeUpdate.select(`circle.rankCircle`).attr(`r`, imageRadius / 2 + 1)

  nodeUpdate
    .select('image.pic')
    .attr('height', imageRadius * 2)
    .attr('width', imageRadius * 2)
    .attr('cursor', 'pointer')

  if (graphType === 'HT') {
    textGroup = nodeUpdate
      .selectAll('g.textGroup')
      .transition()
      .duration(duration)
      .attr(`transform`, `translate(0, 35)`)

    textGroup
      .select('text.name')
      .transition()
      .duration(duration)
      .attr(`text-anchor`, d => `middle`)
      .attr('x', 0)
  } else if (graphType === 'VT') {
    textGroup = nodeUpdate
      .selectAll('g.textGroup')
      .transition()
      .duration(duration)
      .attr(`transform`, `translate(0, 35)`)

    textGroup.select('text.firstname').attr(`text-anchor`, d => `middle`)
    textGroup.select('text.lastname').attr(`text-anchor`, d => `middle`)
    // textGroup.select('text.name').remove()
  } else if (graphType === 'RT') {
    nodeUpdate
      .selectAll('g.textGroup')
      .transition()
      .duration(duration)
      .attr(
        'transform',
        d => `translate(0,0) rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`
      )
    nodeUpdate
      .selectAll('text.name')
      .transition()
      .duration(duration)
      .attr('x', d => (d.x < 180 ? imageRadius + 4 : -(imageRadius + 4)))
      .attr('text-anchor', d => (d.x < 180 ? 'start' : 'end'))
    // .attr(
    //   'transform',
    //   d => 'rotate(' + (d.x < 180 ? d.x - 90 : d.x + 90) + ')'
    // )
    // .text(d => d.data.data.displayName)
  }

  nodeUpdate
    .selectAll('rect.memberHighlight')
    .attr(`display`, d => {
      return d.data.data.displayName
        .toLowerCase()
        .includes(vueControls.getSearchTerm())
        ? `show`
        : `none`
    })
    .attr(`x`, function(d) {
      if (graphType !== 'RT') {
        return -this.parentNode.getBBox().width / 2
      } else {
        return d.x < 180
          ? imageRadius + 4
          : -(imageRadius + 4) + -this.parentNode.getBBox().width
      }
    })
    .attr(`width`, function() {
      if (d3.select(this).attr('display') === 'none') return 0
      return this.parentNode.getBBox().width
    })
  // updateMemberDetails(nodeUpdate)

  // nodeUpdate
  //   .select('image.rank')
  //   .attr('height', imageRadius)
  //   .attr('width', imageRadius)
  //   .attr('cursor', 'pointer')

  // Remove any exiting nodes
  node.exit().remove()
}

function updateLinks(source, link, graphType) {
  // Enter any new links at the parent`s previous position.
  let linkEnter = link
    .enter()
    .insert(`path`, `g`)
    .attr(`class`, `link`)
    .attr(`d`, function(d) {
      let o = { x: source.x0, y: source.y0 }
      return diagonal(o, o)
    })

  // UPDATE
  let linkUpdate = linkEnter.merge(link)

  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(duration)
    .attr(`d`, d => diagonal(d, d.parent))

  // Remove any exiting links
  link
    .exit()
    .transition()
    .duration(duration)
    .attr(`d`, function(d) {
      let o = { x: source.x, y: source.y }
      return diagonal(o, o)
    })
    .remove()

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {
    let path
    if (graphType === 'HT') {
      path = `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} 
      ${d.x}, ${d.y} ${d.x}`
    } else if (graphType === 'VT') {
      path = `M ${s.x} ${s.y}
              C ${s.x} ${(s.y + d.y) / 2},
                ${d.x} ${(s.y + d.y) / 2},
                ${d.x} ${d.y}`
    } else if (graphType === 'RT') {
      path =
        'M' +
        project(s.x, s.y) +
        'C' +
        project(s.x, (s.y + d.y) / 2) +
        ' ' +
        project(s.depth === 1 ? s.x : d.x, (s.y + d.y) / 2) +
        ' ' +
        project(s.depth === 1 ? s.x : d.x, d.y)
    }

    return path
  }
}
function project(x, y) {
  const angle = ((x - 90) / 180) * Math.PI
  const radius = y
  return [radius * Math.cos(angle), radius * Math.sin(angle)]
}

function createMemberDetails() {
  let container = svgContainer
    .append(`g`)
    .attr(`class`, `infoContainer`)
    .attr(`display`, `none`)

  container
    .append(`rect`)
    .attr('class', `infoRect`)
    .attr(`x`, `-5`)
    .attr(`width`, `180`)
    .attr(`height`, `100`)

  container
    .append(`text`)
    .attr('class', 'displayName')
    .attr(`text-align`, `start`)
    .attr(`dy`, `${textSize + textPadding}px`)

  container
    .append(`text`)
    .attr('class', 'teamSize')
    .attr(`text-align`, `start`)
    .attr(`dy`, `${(textSize + textPadding) * 2}px`)

  container
    .append(`text`)
    .attr('class', 'frontLineSize')
    .attr(`text-align`, `start`)
    .attr(`dy`, `${(textSize + textPadding) * 3}px`)

  container
    .append(`text`)
    .attr('class', 'totalPoints')
    .attr(`text-align`, `start`)
    .attr(`dy`, `${(textSize + textPadding) * 4}px`)

  container
    .append(`text`)
    .attr('class', 'totalAmount')
    .attr(`text-align`, `start`)
    .attr(`dy`, `${(textSize + textPadding) * 5}px`)

  container.attr(`width`, function() {
    return this.parentNode.getBBox().width + textPadding
  })
}

function updateMemberDetails(d, position) {
  let container = svgContainer
    .select('g.infoContainer')
    .attr('transform', `translate(${position.x}, ${position.y})`)
    .attr('display', 'show')
  container.select('text.displayName').text(d.data.data.displayName)
  container.select('text.teamSize').text(`Team Size: ${d.data.data.teamSize}`)
  container
    .select('text.frontLineSize')
    .text(`Front Line: ${d.data.data.frontLineSize}`)
  container
    .select('text.totalPoints')
    .text(`Total Points: ${d.data.data.totalPoints}`)
  container
    .select('text.totalAmount')
    .text(`Total Amount: ${d.data.data.totalAmount}`)
}
function updatePinned(pinned, firstPin) {
  inTransition = true
  // Display pin image next to pinned Node
  if (pinned) {
    if (firstPin) {
      firstPin = !firstPin
      pinImage
        .style(`x`, `${pinned.y - 42}px`)
        .style(`y`, `${pinned.x - 42}px`)
        .transition()
        .duration(duration)
        .style(`opacity`, `1`)
        .on(`end`, () => {
          inTransition = false
        })
    } else {
      pinImage
        .transition()
        .duration(duration)
        .style(`x`, `${pinned.y - 42}px`)
        .style(`y`, `${pinned.x - 42}px`)
        .on(`end`, () => {
          inTransition = false
        })
    }
  } else {
    pinImage
      .transition()
      .duration(duration)
      .style(`opacity`, `0`)
      .on(`end`, () => {
        inTransition = false
      })
  }
}

function zoomControls() {
  let zoomGroup = svgContainer
    .append('g')
    .attr('class', 'zoomGroup')
    .attr('transform', `translate(${width - 5}, 5)`)

  let zoomEnter = zoomGroup
    .selectAll('g.zoomData')
    .data(vueControls.zoomControls)
    .enter()
    .append('g')
    .attr('class', 'zoomData')
    .attr(`transform`, (d, i) => `translate(${-40 * (i + 1)}, 0)`)

  zoomEnter
    .append('circle')
    .attr(`class`, `controlCircle`)
    .attr('r', 17)
    .attr('cx', 15)
    .attr('cy', 15)
    // .on('click', d => d.action(d.data))
    .on('mousedown', d => {
      pressed = true
      d.action(d.data)
    })
    .on('mouseup', () => (pressed = false))
    .on('mouseout', () => (pressed = false))

  zoomEnter
    .append('image')
    .attr(`class`, d => d.option)
    .attr('width', 30)
    .attr('height', 30)
    .attr(`preserveAspectRatio`, 'none')
    .attr(`xlink:href`, d => d.img)
    // .on('click', d => d.action(d.data))
    .on('mousedown', d => {
      pressed = true
      d.action(d.data)
    })
    .on('mouseup', () => (pressed = false))
    .on('mouseout', () => (pressed = false))
}

function panControls() {
  let buttonDistance = 30
  let panGroup = svgContainer
    .append('g')
    .attr('class', 'panGroup')
    .attr('transform', `translate(35, ${height - 65})`)

  let panEnter = panGroup
    .selectAll('g.panData')
    .data(vueControls.panControls)
    .enter()
    .append('g')
    .attr('class', 'panData')
    .attr(
      `transform`,
      d =>
        `translate(${d.translate.x * buttonDistance}, ${d.translate.y *
          buttonDistance})`
    )

  panEnter
    .append('circle')
    .attr(`class`, `controlCircle`)
    .attr('r', 17)
    .attr('cx', 17)
    .attr('cy', 17)
    .on('mousedown', d => {
      pressed = true
      d.action(d.data)
    })
    .on('mouseup', () => (pressed = false))
    .on('mouseout', () => (pressed = false))

  panEnter
    .append('image')
    .attr(`class`, d => d.option)
    .attr('width', 34)
    .attr('height', 34)
    .attr(`preserveAspectRatio`, 'none')
    .attr(`xlink:href`, d => d.img)
    .on('mousedown', d => {
      pressed = true
      d.action(d.data)
    })
    .on('mouseup', () => (pressed = false))
    .on('mouseout', () => (pressed = false))
}
window.addEventListener('resize', redrawZoom)

function redrawZoom() {
  let svgWidth = Number(svgContainer.style(`width`).replace('px', ''))
  zoomer.attr('width', Math.max(svgWidth, width))
}

function makeAbsoluteContext(element, svgDocument) {
  return function(x, y) {
    var offset = svgDocument.getBoundingClientRect()
    var matrix = element.getScreenCTM()
    return {
      x: matrix.a * x + matrix.c * y + matrix.e - offset.left,
      y: matrix.b * x + matrix.d * y + matrix.f - offset.top
    }
  }
}

// ------------- Compution functions -------------

function updateHeightDepth(current, depth) {
  current.depth = depth
  let height = 0
  if (current.children) {
    let children = current.children
    let heights = []
    for (let i = 0; i < children.length; ++i) {
      heights.push(updateHeightDepth(children[i], depth + 1))
    }
    height = Math.max(...heights, height) + 1
  }
  current.height = height
  return height
}

function parentOfPinned(selected, pinned, pinnedParent) {
  if (pinned === selected || !pinnedParent) return false
  else if (pinnedParent === selected) return true
  else return parentOfPinned(selected, pinned, pinnedParent.parent)
}

function checkParentOfPinned(selected, pinned) {
  if (pinned) return parentOfPinned(selected, pinned, pinned.parent)
  return false
}

function childOfPinned(selected, pinned) {
  if (!selected) return false
  else if (selected === pinned) return true
  else return childOfPinned(selected.parent, pinned)
}

// Collapse the node and all it`s children
function collapse(d) {
  if (d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

export {
  initializerExported as initialize,
  updateHeightDepth,
  collapse,
  checkParentOfPinned,
  childOfPinned
}
