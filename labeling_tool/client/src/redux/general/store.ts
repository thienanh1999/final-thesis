import { createStore } from 'redux'
import { generalReducer } from './reducer.js'

const store = createStore(generalReducer)

export default store;
