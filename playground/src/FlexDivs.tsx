import * as React from 'react';

export interface IFlexProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>, HTMLElement> {
    type?: string | React.StatelessComponent<IFlexProps> | React.ComponentClass<IFlexProps>;
}

export class FlexRow extends React.Component<IFlexProps>  {

  public render(): React.ReactNode {
    const mergedProps: IFlexProps = {
      ...this.props
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

    return React.createElement(mergedProps.type || 'div', mergedProps);
  }

}

export class FlexCol extends React.Component<IFlexProps>  {

  public render(): React.ReactNode {
    const mergedProps: IFlexProps = {
      ...this.props
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

    return React.createElement(mergedProps.type || 'div', mergedProps);
  }

}
