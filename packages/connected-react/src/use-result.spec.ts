import React from 'react';
import { mount } from 'enzyme';
import useResult from './use-result';

function f0() {
  return 'f0';
}
function f1(a1: string) {
  return 'f1';
}
function f2(a1: string, a2: number) {
  return 'f2';
}
function f3(a1: string, a2: number, a3: string) {
  return 'f3';
}
function f4(a1: string, a2: number, a3: string, a4: number) {
  return 'f4';
}
function f5(a1: string, a2: number, a3: string, a4: number, a5: string) {
  return 'f5';
}
function f6(a1: string, a2: number, a3: string, a4: number, a5: string, a6: number) {
  return 'f6';
}
function f7(a1: string, a2: number, a3: string, a4: number, a5: string, a6: number, a7: string) {
  return 'f7';
}
function f8(
  a1: string, a2: number, a3: string, a4: number, a5: string, a6: number, a7: string, a8: number,
) {
  return 'f8';
}
function f9(
  a1: string, a2: number, a3: string, a4: number, a5: string, a6: number, a7: string, a8: number,
  a9: string,
) {
  return 'f9';
}
function f10(
  a1: string, a2: number, a3: string, a4: number, a5: string, a6: number, a7: string, a8: number,
  a9: string, a10: number,
) {
  return 'f10';
}

// function af1(a1: string): Promise<string> {
//   return Promise.resolve('af1');
// }

// tslint:disable-next-line:variable-name
const Wrapper = ({ hookFn }: { hookFn: Function}) => {
  const data = hookFn();
  return React.createElement(React.Fragment, null, data);
};

// const SuspendedWrapper = ({ hookFn }: { hookFn: Function}) => (
//   <React.Suspense fallback={<div>L...</div>}>
//     <Wrapper hookFn={hookFn} />
//   </React.Suspense>
// );

describe('useResult', () => {
  it('uses function with 0 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(f0) }));
    expect(wrapper.text()).toBe('f0');
  });
  it('uses function with 1 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(f1, 'a1') }));
    expect(wrapper.text()).toBe('f1');
  });
  it('uses function with 2 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(f2, 'a1', 2) }));
    expect(wrapper.text()).toBe('f2');
  });
  it('uses function with 3 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f3, 'a1', 2, 'a3') }));
    expect(wrapper.text()).toBe('f3');
  });
  it('uses function with 4 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f4, 'a1', 2, 'a3', 4) }));
    expect(wrapper.text()).toBe('f4');
  });
  it('uses function with 5 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f5, 'a1', 2, 'a3', 4, 'a5') }));
    expect(wrapper.text()).toBe('f5');
  });
  it('uses function with 6 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f6, 'a1', 2, 'a3', 4, 'a5', 6) }));
    expect(wrapper.text()).toBe('f6');
  });
  it('uses function with 7 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f7, 'a1', 2, 'a3', 4, 'a5', 6, 'a7') }));
    expect(wrapper.text()).toBe('f7');
  });
  it('uses function with 8 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f8, 'a1', 2, 'a3', 4, 'a5', 6, 'a7', 8) }));
    expect(wrapper.text()).toBe('f8');
  });
  it('uses function with 9 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f9, 'a1', 2, 'a3', 4, 'a5', 6, 'a7', 8, 'a9') }));
    expect(wrapper.text()).toBe('f9');
  });
  it('uses function with 10 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f10, 'a1', 2, 'a3', 4, 'a5', 6, 'a7', 8, 'a9', 10) }));
    expect(wrapper.text()).toBe('f10');
  });
  it('uses request with 0 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult({ fn: f0 }) }));
    expect(wrapper.text()).toBe('f0');
  });
  it('uses request with 1 parameter', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult({ fn: f1, parameters: ['a1'] }) }));
    expect(wrapper.text()).toBe('f1');
  });
  it('uses request with 2 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult({ fn: f2, parameters: ['a1', 2] }) }));
    expect(wrapper.text()).toBe('f2');
  });
  it('uses request with 3 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult({ fn: f3, parameters: ['a1', 2, 'a3'] }) }));
    expect(wrapper.text()).toBe('f3');
  });
  it('uses request with 4 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult({ fn: f4, parameters: ['a1', 2, 'a3', 4] }) }));
    expect(wrapper.text()).toBe('f4');
  });
  it('uses request with 5 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult({ fn: f5, parameters: ['a1', 2, 'a3', 4, 'a5'] }) }));
    expect(wrapper.text()).toBe('f5');
  });
  it('uses request with 6 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult({ fn: f6, parameters: ['a1', 2, 'a3', 4, 'a5', 6] }) }));
    expect(wrapper.text()).toBe('f6');
  });
  it('uses request with 7 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(
      { fn: f7, parameters: ['a1', 2, 'a3', 4, 'a5', 6, 'f7'] }) }));
    expect(wrapper.text()).toBe('f7');
  });
  it('uses request with 8 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(
        { fn: f8, parameters: ['a1', 2, 'a3', 4, 'a5', 6, 'f7', 8] }) }));
    expect(wrapper.text()).toBe('f8');
  });
  it('uses request with 9 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(
        { fn: f9, parameters: ['a1', 2, 'a3', 4, 'a5', 6, 'f7', 8, 'f9'] }) }));
    expect(wrapper.text()).toBe('f9');
  });
  it('uses request with 10 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(
        { fn: f10, parameters: ['a1', 2, 'a3', 4, 'a5', 6, 'f7', 8, 'f9', 10] }) }));
    expect(wrapper.text()).toBe('f10');
  });

  // it('strips promise from type 1', () => {
  //   // const wrapper = mount(React.createElement(
  //   //   SuspendedWrapper, { hookFn: () => useResult(af1, 'a1') }));
  //   const wrapper = mount(<SuspendedWrapper hookFn={() => useResult(af1, 'a1')} />);
  //   expect(wrapper.text()).toBe('af1');
  // });
  //
  // it('strips promise from type 2', () => {
  //   expect(() => {
  //     // @ts-ignore
  //     const result: string = useResult({ fn: af1, parameters: ['a1'] });
  //   }).toThrow(Promise);
  // });
});
