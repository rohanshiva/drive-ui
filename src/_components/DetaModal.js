import React from "react";
import Modal from "react-modal";

const modalStyles = {
  content: {
    fontFamily: `"Karla", sans-serif`,
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "0px",
  },
};

export default function DetaModal({ isOpen, toggleModal, children }) {
  return (
    <Modal
      ariaHideApp={false} // fix me
      isOpen={isOpen}
      onRequestClose={toggleModal}
      style={modalStyles}
      contentLabel="DetaModal"
    >
      {children}
    </Modal>
  );
}
