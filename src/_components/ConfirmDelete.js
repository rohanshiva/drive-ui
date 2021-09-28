import React from "react";
import styled from "@emotion/styled";

import {
  smallTextStyle,
  regularTextStyle,
  largeBoldTextStyle,
} from "../styles/_typographies.js";

const DomainModal = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.secondaryFillColor};
  padding: 3px;
  ${regularTextStyle}
  color: ${(props) => props.theme.colors.primary3};
  width: 420px;
`;

const DomainModalTitle = styled.div`
  padding-bottom: 2px;
  ${largeBoldTextStyle}
`;

const DomainBody = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 2px;
`;

const DomainModalDesc = styled.div`
  ${regularTextStyle}
  padding-top: 1px;
  padding-bottom: 1px;
`;

const DomainError = styled.span`
  ${smallTextStyle}
  color: ${(props) => props.theme.colors.deleteRed};
  padding-top: 1px;
`;

const DomainModalFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export const DeleteButton = styled.button`
  margin-left: 2px;
  height: 25px;
  width: 75px;
  border-radius: 0.125rem;
  background-color: transparent;
  ${({ isConfirmed = false }) =>
    isConfirmed
      ? `
      color: ${(props) => props.theme.colors.deleteRed};
      border: 1px solid ${(props) => props.theme.colors.deleteRed};
      &:hover {
        cursor: pointer;
        border: 1px solid ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};
      }
    `
      : `
      color: ${(props) => props.theme.colors.primary2};
      border: 1px solid ${(props) => props.theme.colors.primary1};
      &:hover {
        cursor: not-allowed;
      }
    `}
`;

const Button = styled.button`
  margin-left: 2px;
  height: 25px;
  border-radius: 0.125rem;
  padding: 0 10px;
  background-color: transparent;
  ${({ disabled = false }) =>
    disabled
      ? `
      color: ${(props) => props.theme.colors.firstTextColor};
      border: 1px solid ${(props) => props.theme.colors.firstTextColor};
      &:hover {
        cursor: not-allowed;
      }
    `
      : `
      color: ${(props) => props.theme.colors.primary2};
      border: 1px solid ${(props) => props.theme.colors.primary1};
      &:hover {
        cursor: pointer;
        border: 1px solid ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};
      }
    `}
`;

const ConfirmDelete = ({ errorMessage, onConfirm, onCancel }) => (
  <DomainModal>
    <DomainModalTitle>Confirm Delete</DomainModalTitle>
    <DomainBody>
      <DomainModalDesc>
        Are you sure you want to delete this item?
      </DomainModalDesc>
      <DomainError>{errorMessage}</DomainError>
    </DomainBody>
    <DomainModalFooter>
      <DeleteButton alt="Delete" title="Delete" isConfirmed onClick={onConfirm}>
        Delete
      </DeleteButton>
      <Button alt="Cancel" title="Cancel" onClick={onCancel}>
        Cancel
      </Button>
    </DomainModalFooter>
  </DomainModal>
);

export default ConfirmDelete;
