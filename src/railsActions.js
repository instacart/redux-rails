// index, show, update, create, destroy
export default {
  index: ({resource, controller}) => {
    return {
      type: `${resource}.INDEX`,
      controller
    }
  },
  show: ({id, resource, controller}) => {
    return {
      type: `${resource}.SHOW`,
      data: { id },
      controller
    }
  },
  update: ({id, attributes, resource, controller}) => {
    return {
      type: `${resource}.UPDATE`,
      data: Object.assign({}, { id }, attributes),
      controller
    }
  },
  create: ({resource, attributes, controller}) => {
    return {
      type: `${resource}.CREATE`,
      data: attributes,
      controller
    }
  },
  destroy: ({id, resource, controller}) => {
    return {
      type: `${resource}.DESTROY`,
      data: { id },
      controller
    }
  }
}
