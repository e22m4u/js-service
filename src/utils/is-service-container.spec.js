import {expect} from 'chai';
import {ServiceContainer} from '../service-container.js';
import {isServiceContainer} from './is-service-container.js';
import {SERVICE_CONTAINER_CLASS_NAME} from '../service-container.js';

describe('isServiceContainer', function () {
  it('should return true for ServiceContainer instance', function () {
    const container = new ServiceContainer();
    const res = isServiceContainer(container);
    expect(res).to.be.true;
  });

  it('should return true if the given object has the kinds property of its constructor', function () {
    class CustomContainer {
      static kinds = [SERVICE_CONTAINER_CLASS_NAME];
    }
    const container = new CustomContainer();
    const res = isServiceContainer(container);
    expect(res).to.be.true;
  });

  it('should return false for not-container values', function () {
    expect(isServiceContainer('str')).to.be.false;
    expect(isServiceContainer(10)).to.be.false;
    expect(isServiceContainer(true)).to.be.false;
    expect(isServiceContainer(false)).to.be.false;
    expect(isServiceContainer({foo: 'bar'})).to.be.false;
    expect(isServiceContainer([])).to.be.false;
    expect(isServiceContainer(null)).to.be.false;
    expect(isServiceContainer(undefined)).to.be.false;
  });
});
