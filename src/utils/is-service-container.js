import {SERVICE_CONTAINER_CLASS_NAME} from '../service-container.js';

/**
 * Определяет, является ли аргумент сервис-контейнером.
 *
 * @param {*} container
 *
 * @returns {false|*}
 */
export function isServiceContainer(container) {
  return Boolean(
    container &&
      typeof container === 'object' &&
      typeof container.constructor === 'function' &&
      Array.isArray(container.constructor.kinds) &&
      container.constructor.kinds.includes(SERVICE_CONTAINER_CLASS_NAME),
  );
}
