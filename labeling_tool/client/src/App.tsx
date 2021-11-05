import {
	Router,
	Route,
} from "react-router-dom";
import Main from './components';
import Register from "./components/register/Register";
import history from './history';
import Dashborad from "./components/dashboard/Dashboard";
import Login from "./components/login/Login";
import Header from "./components/header/Header";
import CreateProject from "./components/createproject/CreateProject";
import ProjectDetail from "./components/projectdetail/ProjectDetail";
function App() {
	return (
		<div className={`container`}>
			< Header />
			<Router history={history}>
				<Route exact path='/' component={Main} />
				<Route exact path='/register' component={Register} />
				<Route exact path='/dashboard' component={Dashborad} />
				<Route exact path='/login' component={Login} />
				<Route exact path='/createproject' component={CreateProject} />
				<Route exact path='/project' component={ProjectDetail} />
			</Router>
		</div>
	);
}

export default App;
