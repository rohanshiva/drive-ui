import styled from "@emotion/styled";

export const RootContainer = styled.div`
  margin: 0;
  font-family: "Karla", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  ::-webkit-scrollbar {
    max-width: 5px;
    max-height: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f6f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
