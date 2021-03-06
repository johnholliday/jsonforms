/*
  The MIT License

  Copyright (c) 2018 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import * as React from 'react';
import {
  Actions,
  ControlElement,
  getData,
  HorizontalLayout,
  jsonformsReducer,
  JsonFormsState,
  JsonSchema,
  NOT_APPLICABLE,
  UISchemaElement,
  update
} from '@jsonforms/core';
import BooleanField, { materialBooleanFieldTester } from '../../src/fields/MaterialBooleanField';
import HorizontalLayoutRenderer from '../../src/layouts/MaterialHorizontalLayout';
import { Provider } from 'react-redux';
import * as TestUtils from 'react-dom/test-utils';
import * as ReactDOM from 'react-dom';
import { combineReducers, createStore, Store } from 'redux';
import { materialFields, materialRenderers } from '../../src';

export const initJsonFormsStore = (testData: any, testSchema: JsonSchema, testUiSchema: UISchemaElement): Store<JsonFormsState> => {
  const s: JsonFormsState = {
    jsonforms: {
      renderers: materialRenderers,
        fields: materialFields,
    }
  };
  const store: Store<JsonFormsState> = createStore(
    combineReducers({ jsonforms: jsonformsReducer() }),
    s
  );
  store.dispatch(Actions.init(testData, testSchema, testUiSchema));
  return store;
};

const data = { foo: true };
const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'boolean'
    }
  }
};
const uischema: ControlElement = {
  type: 'Control',
  scope: '#/properties/foo'
};

describe('Material boolean field tester', () => {

  const control: ControlElement = {
    type: 'Control',
    scope: '#/properties/foo',
  };

  it('should fail', () => {
    expect(materialBooleanFieldTester(undefined, undefined)).toBe(NOT_APPLICABLE);
    expect(materialBooleanFieldTester(null, undefined)).toBe(NOT_APPLICABLE);
    expect(materialBooleanFieldTester({type: 'Foo'}, undefined)).toBe(NOT_APPLICABLE);
    expect(materialBooleanFieldTester({type: 'Control'}, undefined)).toBe(NOT_APPLICABLE);
    expect(
      materialBooleanFieldTester(
        control,
        {type: 'object', properties: {foo: {type: 'string'}}}
      )
    ).toBe(NOT_APPLICABLE);
    expect(
      materialBooleanFieldTester(
        control,
        {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'boolean'
            }
          }
        }
      )
    ).toBe(NOT_APPLICABLE);
  });

  it('should succeed', () => {
    expect(
      materialBooleanFieldTester(
        control,
        {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean'
            }
          }
        }
      )
    ).toBe(2);
  });
});

describe('Material boolean field', () => {

  /** Use this container to render components */
  const container = document.createElement('div');

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should autofocus first element', () => {
    const jsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        firstBooleanField: { type: 'boolean' },
        secondBooleanField: { type: 'boolean' }
      }
    };
    const firstControlElement: ControlElement = {
      type: 'Control',
      scope: '#/properties/firstBooleanField',
      options: {
        focus: true
      }
    };
    const secondControlElement: ControlElement = {
      type: 'Control',
      scope: '#/properties/secondBooleanField',
      options: {
        focus: true
      }
    };
    const layout: HorizontalLayout = {
      type: 'HorizontalLayout',
      elements: [
        firstControlElement,
        secondControlElement
      ]
    };
    const store = initJsonFormsStore(
      {
        'firstBooleanField': true,
        'secondBooleanField': false
      },
      schema,
      layout
    );
    const tree = ReactDOM.render(
      <Provider store={store}>
        <HorizontalLayoutRenderer schema={jsonSchema} uischema={layout}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const inputs = TestUtils.scryRenderedDOMComponentsWithTag(tree, 'input');
    expect(document.activeElement).not.toBe(inputs[0]);
    expect(document.activeElement).toBe(inputs[1]);
  });

  // seems to be broken in material-ui
  it('should autofocus via option', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
      options: {
        focus: true
      }
    };
    const store = initJsonFormsStore(data, schema, control);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={control}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(document.activeElement).toBe(input);
  });

  it('should not autofocus via option', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
      options: {
        focus: false
      }
    };
    const store = initJsonFormsStore(data, schema, control);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={control}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(input.autofocus).toBe(false);
  });

  it('should not autofocus by default', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    const store = initJsonFormsStore(data, schema, control);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(document.activeElement).not.toBe(input);
  });

  it('should render', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;

    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBeTruthy();
  });

  it('should update via input event', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;

    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    input.checked = false;
    TestUtils.Simulate.change(input);
    expect(getData(store.getState()).foo).toBeFalsy();
  });

  it('should update via action', () => {
    const store = initJsonFormsStore({'foo': false}, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    store.dispatch(update('foo', () => false));
    expect(input.checked).toBeFalsy();
    expect(getData(store.getState()).foo).toBeFalsy();
  });

  it('should update with undefined value', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    store.dispatch(update('foo', () => undefined));
    expect(input.checked).toBeFalsy();
  });

  it('should update with null value', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    store.dispatch(update('foo', () => null));
    expect(input.checked).toBeFalsy();
  });

  it('should not update with wrong ref', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    store.dispatch(update('bar', () => 11));
    expect(input.checked).toBeTruthy();
  });

  it('should not update with null ref', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    store.dispatch(update(null, () => false));
    expect(input.checked).toBeTruthy();
  });

  it('should not update with an undefined ref', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    store.dispatch(update(undefined, () => false));
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(input.checked).toBeTruthy();
  });

  it('can be disabled', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema} enabled={false}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(input.disabled).toBeTruthy();
  });

  it('should be enabled by default', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema}/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(input.disabled).toBeFalsy();
  });

  it('id should be present in output', () => {
    const store = initJsonFormsStore(data, schema, uischema);
    const tree = ReactDOM.render(
      <Provider store={store}>
        <BooleanField schema={schema} uischema={uischema} id='myid'/>
      </Provider>,
      container
    ) as React.Component<any, any, any>;
    const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
    expect(input.id).toBe('myid');
  });
});
