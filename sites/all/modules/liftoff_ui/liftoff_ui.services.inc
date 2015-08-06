<?php
/**
 * @file
 * liftoff_ui.services.inc
 */

/**
 * Implements hook_default_services_endpoint().
 */
function liftoff_ui_default_services_endpoint() {
  $export = array();

  $endpoint = new stdClass();
  $endpoint->disabled = FALSE; /* Edit this to true to make a default endpoint disabled initially */
  $endpoint->api_version = 3;
  $endpoint->name = 'liftoff_ui';
  $endpoint->server = 'rest_server';
  $endpoint->path = 'services/rest';
  $endpoint->authentication = array(
    'services' => 'services',
  );
  $endpoint->server_settings = array();
  $endpoint->resources = array(
    'file' => array(
      'operations' => array(
        'retrieve' => array(
          'enabled' => '1',
        ),
        'delete' => array(
          'enabled' => '1',
        ),
        'index' => array(
          'enabled' => '1',
        ),
        'update' => array(
          'enabled' => '1',
        ),
      ),
      'actions' => array(
        'create_raw' => array(
          'enabled' => '1',
        ),
      ),
    ),
    'menu' => array(
      'operations' => array(
        'retrieve' => array(
          'enabled' => '1',
        ),
      ),
    ),
    'node' => array(
      'operations' => array(
        'retrieve' => array(
          'enabled' => '1',
        ),
        'update' => array(
          'enabled' => '1',
        ),
        'delete' => array(
          'enabled' => '1',
        ),
        'index' => array(
          'enabled' => '1',
        ),
      ),
      'relationships' => array(
        'files' => array(
          'enabled' => '1',
        ),
      ),
      'targeted_actions' => array(
        'attach_file' => array(
          'enabled' => '1',
        ),
      ),
    ),
    'liftoff_ui' => array(
      'operations' => array(
        'create' => array(
          'enabled' => '1',
        ),
        'retrieve' => array(
          'enabled' => '1',
        ),
        'update' => array(
          'enabled' => '1',
        ),
        'delete' => array(
          'enabled' => '1',
        ),
        'index' => array(
          'enabled' => '1',
        ),
      ),
    ),
  );
  $endpoint->debug = 0;
  $export['liftoff_ui'] = $endpoint;

  return $export;
}
