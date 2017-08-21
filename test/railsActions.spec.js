import { index, show, update, create, destroy } from '../src/railsActions'

describe('railsActions', () => {

  describe('INDEX action', () => {
    const resource = 'Posts'
    const type = `${resource}.INDEX`
    const baseExpectedAction = { type, data: { queryParams: undefined } }
    const baseOptions = { resource }

    it('should create an action to call INDEX on the specified resource', () => {
      const expectedAction = baseExpectedAction

      expect(index(baseOptions)).toEqual(expectedAction)
    })

    it('should create an action to call INDEX with the specified controller', () => {
      const controller = `foos`
      const expectedAction  = { ...baseExpectedAction, controller }

      expect(index({...baseOptions, controller})).toEqual(expectedAction)
    })

    it('should create an action to call INDEX with the specified queryParams', () => {
      const queryParams = { q: 'fooBar'}
      const expectedAction  = { ...baseExpectedAction, data: { queryParams } }

      expect(index({...baseOptions, queryParams})).toEqual(expectedAction)
    })
  })

  describe('SHOW action', () => {
    const resource = 'Posts'
    const type = `${resource}.SHOW`
    const id = 123

    it('should create an action to call SHOW on the specified resource', () => {
      const expectedAction = { type, data: { id } }

      expect(show({id, resource})).toEqual(expectedAction)
    })

    it('should create an action to call SHOW with the specified controller', () => {
      const controller = 'foos'
      const expectedAction = { type, data: { id }, controller }

      expect(show({id, resource, controller})).toEqual(expectedAction)
    })
  })

  describe('UPDATE action', () => {
    const resource = 'Posts'
    const type = `${resource}.UPDATE`
    const id = 123
    const attributes = { id, foo: 'bar', tests: [1, 2, 3, 4] }

    it('should create an action to call UPDATE on the specified resource', () => {
      const expectedAction = { type, data: attributes }

      expect(update({id, attributes, resource})).toEqual(expectedAction)
    })

    it('should create an action to call UPDATE with the specified controller', () => {
      const controller = 'foos'
      const expectedAction = { type, data: attributes, controller }

      expect(update({id, attributes, resource, controller})).toEqual(expectedAction)
    })
  })

  describe('CREATE action', () => {
    const resource = 'Posts'
    const type = `${resource}.CREATE`
    const attributes = { foo: 'bar', tests: [1, 2, 3, 4] }

    it('should create an action to call CREATE on the specified resource', () => {
      const expectedAction = { type, data: attributes }

      expect(create({attributes, resource})).toEqual(expectedAction)
    })

    it('should create an action to call CREATE with the specified controller', () => {
      const controller = 'foos'
      const expectedAction = { type, data: attributes, controller }

      expect(create({attributes, resource, controller})).toEqual(expectedAction)
    })
  })

  describe('DESTROY action', () => {
    const resource = 'Posts'
    const type = `${resource}.DESTROY`
    const id = 123

    it('should create an action to call DESTROY on the specified resource', () => {
      const expectedAction = { type, data: { id } }

      expect(destroy({id, resource})).toEqual(expectedAction)
    })

    it('should create an action to call DESTROY with the specified controller', () => {
      const controller = 'foos'
      const expectedAction = { type, data: { id }, controller }

      expect(destroy({id, resource, controller})).toEqual(expectedAction)
    })
  })

})
