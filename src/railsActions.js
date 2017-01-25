// index, show, update, create, destroy
export default {
  index: ({resource}) => {
    return {
      type: `${resource}.INDEX`
    }
  },
  show: ({id, resource}) => {
    return {
      type: `${resource}.SHOW`,
      data: { id }
    }
  },
  update: ({id, attributes, resource}) => {
    return {
      type: `${resource}.UPDATE`,
      data: Object.assign({}, { id }, attributes)
    }
  },
  create: ({resource, attributes}) => {
    return {
      type: `${resource}.CREATE`,
      data: attributes
    }
  },
  destroy: ({id, resource}) => {
    return {
      type: `${resource}.DESTROY`,
      data: { id }
    }
  }
}
