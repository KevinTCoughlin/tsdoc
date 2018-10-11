import * as React from 'react';

export interface IFlexDivProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    type?: string;
}

export const flexRowDiv: (props: IFlexDivProps) => JSX.Element = (props: IFlexDivProps) => {
  // tslint:disable-next-line
  const { type: TagName = 'div' } = props;
  const style: React.CSSProperties  = { display: 'flex', flexDirection: 'row', ...props.style};

  return (
    <TagName
      {...props}
      style={ style }>
      {props.children}
    </TagName>
  );
};

export const flexColDiv: (props: IFlexDivProps) => JSX.Element = (props: IFlexDivProps) => {
  // tslint:disable-next-line
  const { type: TagName = 'div' } = props;
  const style: React.CSSProperties  = { display: 'flex', flexDirection: 'column', ...props.style};

  return (
    <TagName
      {...props}
      style={ style }>
      {props.children}
    </TagName>
  );
};
