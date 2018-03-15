export const index = ({resource, controller, queryParams}) => {
  return (dispatch) => {
    
  }

  // return {
  //   type: `${resource}.INDEX`,
  //   data: { queryParams },
  //   controller
  // }
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


// function makeASandwich(forPerson, secretSauce) {
//   return {
//     type: 'MAKE_SANDWICH',
//     forPerson,
//     secretSauce
//   };
// }
// function fetchSecretSauce() {
//   return fetch('https://www.google.com/search?q=secret+sauce');
// }
// function makeASandwichWithSecretSauce(forPerson) {

//   return function (dispatch) {
//     return fetchSecretSauce().then(
//       sauce => dispatch(makeASandwich(forPerson, sauce)),
//       error => dispatch(apologize('The Sandwich Shop', forPerson, error))
//     );
//   };
// }

// // Thunk middleware lets me dispatch thunk async actions
// // as if they were actions!

// store.dispatch(
//   makeASandwichWithSecretSauce('Me')
// );