import React from "react";
import Navbar from "react-bootstrap/Navbar";
import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

/**
 * Renders the navbar component with a sign-in button if a user is not authenticated
 */
export const PageLayout = (props) => {
  const isAuthenticated = useIsAuthenticated();
  console.log("PageLayot props:", props);

  return (
    <>
      <Navbar bg="primary" variant="dark" className="justify-content-between">
        <a className="navbar-brand" href="/">
          File App
        </a>
        {isAuthenticated ? <SignOutButton /> : <SignInButton />}
      </Navbar>
      <div className="App">{props.children}</div>
    </>
  );
};
