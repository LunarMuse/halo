/* tslint:disable */
/* eslint-disable */
/**
 * Halo
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.21.0-SNAPSHOT
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { NotificationTemplate } from './notification-template';

/**
 * 
 * @export
 * @interface NotificationTemplateList
 */
export interface NotificationTemplateList {
    /**
     * Indicates whether current page is the first page.
     * @type {boolean}
     * @memberof NotificationTemplateList
     */
    'first': boolean;
    /**
     * Indicates whether current page has previous page.
     * @type {boolean}
     * @memberof NotificationTemplateList
     */
    'hasNext': boolean;
    /**
     * Indicates whether current page has previous page.
     * @type {boolean}
     * @memberof NotificationTemplateList
     */
    'hasPrevious': boolean;
    /**
     * A chunk of items.
     * @type {Array<NotificationTemplate>}
     * @memberof NotificationTemplateList
     */
    'items': Array<NotificationTemplate>;
    /**
     * Indicates whether current page is the last page.
     * @type {boolean}
     * @memberof NotificationTemplateList
     */
    'last': boolean;
    /**
     * Page number, starts from 1. If not set or equal to 0, it means no pagination.
     * @type {number}
     * @memberof NotificationTemplateList
     */
    'page': number;
    /**
     * Size of each page. If not set or equal to 0, it means no pagination.
     * @type {number}
     * @memberof NotificationTemplateList
     */
    'size': number;
    /**
     * Total elements.
     * @type {number}
     * @memberof NotificationTemplateList
     */
    'total': number;
    /**
     * Indicates total pages.
     * @type {number}
     * @memberof NotificationTemplateList
     */
    'totalPages': number;
}

