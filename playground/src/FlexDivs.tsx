import * as React from 'react';

export interface IFlexDivProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
}

export const flexRowDiv: (props: IFlexDivProps) => JSX.Element = (props: IFlexDivProps) => {
  const mergedProps: IFlexDivProps = {
    ...props
  };

  if (mergedProps.style === undefined) {
    mergedProps.style = { };
  }
  if (mergedProps.style.display === undefined) {
    mergedProps.style.display = 'flex';
  }
  if (mergedProps.style.flexDirection === undefined) {
    mergedProps.style.flexDirection = 'row';
  }

  return React.createElement('div', mergedProps);
};

export const flexColDiv: (props: IFlexDivProps) => JSX.Element = (props: IFlexDivProps) => {
  const mergedProps: IFlexDivProps = {
    ...props
  };

  if (mergedProps.style === undefined) {
    mergedProps.style = { };
  }
  if (mergedProps.style.display === undefined) {
    mergedProps.style.display = 'flex';
  }
  if (mergedProps.style.flexDirection === undefined) {
    mergedProps.style.flexDirection = 'column';
  }

  return React.createElement('div', mergedProps);
};
