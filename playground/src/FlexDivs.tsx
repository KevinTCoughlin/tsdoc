import * as React from 'react';

export interface IFlexDivProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    type?: string;
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

  // tslint:disable-next-line
  const { type: TagName = 'div' } = mergedProps;

  return <TagName style={mergedProps.style}>{mergedProps.children}</TagName>;
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

  // tslint:disable-next-line
  const { type: TagName = 'div' } = mergedProps;

  return <TagName style={mergedProps.style}>{mergedProps.children}</TagName>;
};
