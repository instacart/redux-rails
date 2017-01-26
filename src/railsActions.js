export function index({resource, controller}) {
  return {
    type: `${resource}.INDEX`,
    controller
  }
}

export function show({id, resource, controller}) {
  return {
    type: `${resource}.SHOW`,
    data: { id },
    controller
  }
}

export function update({id, attributes, resource, controller}) {
  return {
    type: `${resource}.UPDATE`,
    data: Object.assign({}, { id }, attributes),
    controller
  }
}

export function create({resource, attributes, controller}) {
  return {
    type: `${resource}.CREATE`,
    data: attributes,
    controller
  }
}

export function destroy({id, resource, controller}) {
  return {
    type: `${resource}.DESTROY`,
    data: { id },
    controller
  }
}

export default { index, show, update, create, destroy }
