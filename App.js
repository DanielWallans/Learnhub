import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { auth } from './firebaseConfig';
import StudentProfile from './StudentProfile';
import OrganizacaoPlanejamento from './components/OrganizacaoPlanejamento';
// ...existing code...

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Switch>
        <Route path="/student-profile">
          {user ? <StudentProfile /> : <Redirect to="/login" />}
        </Route>
        {<Route path="/organizacao-planejamento" element={<OrganizacaoPlanejamento />} />}
        <Route path="/dashboard" element={<Dashboard />} />
      </Switch>
    </Router>
  );
}

export default App;
