export const index = ({resource, controller, queryParams}) => {
  return {
    type: `${resource}.INDEX`,
    data: { queryParams },
    controller
  }
}

export const show = ({id, resource, controller, queryParams}) => {
  return {
    type: `${resource}.SHOW`,
    data: { id, queryParams },
    controller
  }
}

export const update = ({id, attributes, resource, controller}) => {
  return {
    type: `${resource}.UPDATE`,
    data: { id, ...attributes },
    controller
  }
}

export const create = ({resource, attributes, controller}) => {
  return {
    type: `${resource}.CREATE`,
    data: attributes,
    controller
  }
}

export const destroy = ({id, resource, controller}) => {
  return {
    type: `${resource}.DESTROY`,
    data: { id },
    controller
  }
}

export default { index, show, update, create, destroy }
