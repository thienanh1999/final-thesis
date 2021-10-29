import {
	Router,
	Route,
} from "react-router-dom";
import Main from './components';
import Register from "./components/register/Register";
import history from './history';
import Dashborad from "./components/dashboard/Dashboard";

function App() {
	return (
		<Router history={history}>
			<Route exact path='/' component={Main} />
			<Route path='/register' component={Register} />
			<Route path='/dashboard' component={Dashborad} />
		</Router>
	);
}

export default App;
