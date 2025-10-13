import {ServiceContainer} from '../service-container.js';

/**
 * Определяет, является ли аргумент сервис-контейнером.
 *
 * @param container
 */
export declare function isServiceContainer(
  container: unknown,
): container is ServiceContainer;
