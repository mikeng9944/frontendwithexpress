import "./App.css";

import { useState, useEffect } from "react";

function App() {
  const [username, setUserName] = useState<string>("");

  useEffect(() => {
    loadusername();
  }, []);

  const loadusername = async () => {
    const userinfo = await fetch(
      "https://frontendwithexpress.azurewebsites.net/user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 13,
        }),
      }
    ).then((response) => response.json());

    setUserName(JSON.parse(JSON.stringify(userinfo)).name);
  };

  useEffect(() => {
    loadconnection();
  }, []);

  const loadconnection = async () => {
    const connecitonresults = await fetch(
      "https://frontendwithexpress.azurewebsites.net/backendconnection",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((response) => response.text());

    console.log(connecitonresults);
  };

  return (
    <div className="App">
      <p>{username}</p>
    </div>
  );
}

export default App;
