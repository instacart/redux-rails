import middleWare from './middleWare'
import apiReducer from './apiReducer'


// show, index, update, create, destroy, edit
const railsActions = {
  show: ({id}) => {
    return {
      type: 'show',
      data: { id }
    }
  }
}

export {
  middleWare,
  apiReducer,
  railsActions
}



// EXAMPLES
//
// GET	  /photos	       Photos	index	  display a list of all photos
// GET	  /photos/new    Photos	new	    return an HTML form for creating a new photo
// POST   /photos	       Photos	create	create a new photo
// GET	  /photos/1	     Photos	show	  display a specific photo
// GET	  /photos/1/edit Photos	edit	  return an HTML form for editing a photo
// PUT	  /photos/1	     Photos	update	update a specific photo
// DELETE /photos/1	     Photos	destroy	delete a specific photo
