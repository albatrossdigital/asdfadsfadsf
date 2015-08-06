<?php
/**
 * @file
 * liftoff_ui.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function liftoff_ui_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "services" && $api == "services") {
    return array("version" => "3");
  }
}
