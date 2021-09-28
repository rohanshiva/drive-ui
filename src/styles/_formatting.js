import { css } from "@emotion/react";

export const margin = (side, x) => css`margin-${side}: ${2 ** x * 0.25}rem;`;
export const padding = (side, x) => css`padding-${side}: ${2 ** x * 0.25}rem;`;
