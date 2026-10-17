import React from "react";
import "./From.css";

type FromProps = {
    email: string;
  };
  
  function From({email}: FromProps) {
    return (
      <div className="email-from">
        <span className="email-from__label">
          From
        </span>
  
        <span className="email-from__email">
          {email}
        </span>
      </div>
    );
  }
  
  export default From;