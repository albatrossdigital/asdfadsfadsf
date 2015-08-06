<?php

/**
 * @file
 * Link general menu functionalities to services module.
 */
include_once 'liftoff_ui.vo.inc';

/**
 * Callback for retrieving menu resources.
 *
 * @param $menu_name
 *   Machine name of menu that is to be retrieved
 *
 * @return object
 *   ServicesMenu object
 */
function _liftoff_ui_menu_index($menu_name) {
  $result = new ServicesMenu($menu_name);

  $menu = (object) menu_build_tree($menu_name);
  $result->tree = _liftoff_ui_menu_serialize_tree_data($menu);

  return $result->tree;
}


/**
 * Callback for retrieving menu resources.
 *
 * @param $menu_name
 *   Machine name of menu that is to be retrieved
 *
 * @return object
 *   ServicesMenu object
 */
function _liftoff_ui_menu_retrieve($mlid) {
  return (object) menu_link_load($mlid);
}

/**
 * Callback for creating/editing menu items.
 *
 * @param $menu_item
 *   Machine name of menu that is to be retrieved
 *
 * @return $menu_item
 *   ServicesMenu object
 */
function _liftoff_ui_menu_save($menu_item) {
  global $user;

  // New
  if (empty($menu_item['id']) || $menu_item['id'] == 'new') {
    $item = array();
    $item['node'] = new stdClass();
    $item['node']->title = !empty($menu_item['title']) ? $menu_item['title'] : t('New link');
    $item['node']->type = $menu_item['type'];
    node_object_prepare($item['node']);
    $item['node']->language = LANGUAGE_NONE;
    $item['node']->uid = $user->uid; 
    $item['node']->status = 0;
    $item['node'] = node_submit($item['node']); // Prepare node for saving
    $item['node']->body[LANGUAGE_NONE][0]['value'] = '<p>&nbsp;</p>';
    $item['node']->body[LANGUAGE_NONE][0]['format'] = 'filtered_html';
    node_save($item['node']);
    dpm($item['node']);

    $item['menu'] = array(
      'link_path' => 'node/' . $item['node']->nid,
      'link_title' => $item['node']->title,
      'plid' => !empty($menu_item['parent']) ? $menu_item['parent'] : NULL,
      'menu_name' => $menu_item['menu_name'],
      'weight' => !empty($menu_item['weight']) ? $menu_item['weight'] : 0,
      'expanded' => !empty($menu_item['expanded']) ? $menu_item['expanded'] : 1,
    );
    $item_id = menu_link_save($item['menu']);
  }
  // Update
  else {
    // Check updates to see what we actually need to save
    $item = _liftoff_ui_menu_load($menu_item['id']);
    if (isset($menu_item['title']) && $item['menu']['link_title'] != $menu_item['title']) {
      $item['node']->title = $menu_item['title'];
      $item['save_node'] = TRUE;
      $item['menu']['link_title'] = $menu_item['title'];
      $item['save_menu'] = TRUE;
    }
    if (isset($menu_item['status']) && function_exists('workbench_moderation_moderate')) {
      $item['save_node'] = TRUE;
      $item['node']->revision = 1;
      $item['node']->log = t('State changed to !state', array('!state' => $menu_item['status']));
      node_save($item['node']);
      workbench_moderation_moderate($item['node'], $menu_item['status']);
    }
    if (isset($menu_item['user'])) {
      $item['node']->uid = $menu_item['user'];
      $item['save_node'] = TRUE;
    }
    if (isset($menu_item['weight']) && $item['menu']['weight'] != $menu_item['weight']) {
      $item['menu']['weight'] = $menu_item['weight'];
      $item['save_menu'] = TRUE;
    }
    if (isset($menu_item['parent']) && $item['menu']['plid'] != $menu_item['parent']) {
      $item['menu']['plid'] = $menu_item['parent'];
      $item['save_menu'] = TRUE;
    }
    if (isset($menu_item['type']) && $menu_item['type'] != $item['node']->type) {
      $item['node']->type = $menu_item['type'];
      $item['save_node'] = TRUE;
    }
    if (isset($menu_item['linkUrl']) && $item['node']->type == 'link' && (empty($item['node']->field_url) || $item['node']->field_url[LANGUAGE_NONE][0]['url'] != $menu_item['linkUrl'])) {
      $item['node']->field_url[LANGUAGE_NONE][0]['url'] = $menu_item['linkUrl'];
    }
    if (isset($menu_item['gdriveFile']) && $item['node']->type == 'gdrive' && (empty($item['node']->field_url) || $item['node']->field_url[LANGUAGE_NONE][0]['url'] != $menu_item['gdriveFile']['url'])) {
      $item['node']->field_url[LANGUAGE_NONE][0]['url'] = $menu_item['gdriveFile']['url'];
      $item['node']->field_file_metadata[LANGUAGE_NONE][0]['value'] = json_encode($menu_item['gdriveFile']);
      $item['save_node'] = TRUE;
    }
    // Import html from a url, query with xpath
    if (isset($menu_item['import'])) {
      $imported = _liftoff_ui_import($menu_item['import'], $menu_item);
      if (!empty($imported)) {
        $item['node']->body[LANGUAGE_NONE][0] = array(
          'format' => 'filtered_html',
          'value' => $imported['content'],
        );
        if (!empty($imported['image'])) {
          $item['node']->field_picture[LANGUAGE_NONE][0] = (array)$imported['image'];
        }
        $item['save_node'] = TRUE;
      }
    }

    // Save them
    if ($item['save_node']) {
      $item['node']->title = !empty($item['node']->title) ? $item['node']->title : t('New Item');
      node_save($item['node']);
    }
    if ($item['save_menu']) {
      menu_link_save($item['menu']);
    }
  }
  
  //dpm($menu_item);
  //dpm($item);
 
  
  if (!empty($item['menu'])) {
    $return = _liftoff_ui_menu_serialize_item_data($item['menu'], !empty($item['node']) ? $item['node'] : NULL);
    if (isset($imported['content'])) {
      $return->imported = $imported['content'];
    }
    return $return;
  }
  

  //$item = $menu_item->menu_name;
}


/**
 * Callback for retrieving menu resources.
 *
 * @param $menu_name
 *   Machine name of menu that is to be retrieved
 *
 * @return object
 *   ServicesMenu object
 */
function _liftoff_ui_menu_load($mlid) {
  $return = array('save_node' => FALSE, 'save_menu' => FALSE, 'node' => NULL);
  $return['menu'] = menu_link_load($mlid);
  if ($return['menu']['router_path'] == 'node/%') {
    $return['node'] = node_load((int)str_replace('node/', '', $return['menu']['link_path']));
  }
  return $return;
}

/*

$item: An associative array representing a menu link item, with elements:

link_path: (required) The path of the menu item, which should be normalized first by calling drupal_get_normal_path() on it.
link_title: (required) Title to appear in menu for the link.
menu_name: (optional) The machine name of the menu for the link. Defaults to 'navigation'.
weight: (optional) Integer to determine position in menu. Default is 0.
expanded: (optional) Boolean that determines if the item is expanded.
options: (optional) An array of options, see l() for more.
mlid: (optional) Menu link identifier, the primary integer key for each menu link. Can be set to an existing value, or to 0 or NULL to insert a new link.
plid: (optional) The mlid of the parent.
router_path: (optional) The path of the relevant router item.
*/




/**
 * Serializes the menu tree data.
 *
 * @param $data
 *   A fully built menu tree
 *
 * @return
 *   Serialized menu array
 */
function _liftoff_ui_menu_serialize_tree_data($data) {

  $result = array();

  foreach ($data as $item_key => $item_value) {
    $item = new ServicesMenuItem();

    /*foreach ($item->link as $link_key => $link_value) {
      if (isset($item_value['link'][$link_key]))
        $item->link->$link_key = $item_value['link'][$link_key];
    }*/
    $menu_item = $item_value['link'];
    $item_data = _liftoff_ui_menu_load($menu_item['mlid']);
    $item = _liftoff_ui_menu_serialize_item_data($menu_item, $item_data['node']);   

    if (isset($item_value['below'])) {
      $item->nodes = _liftoff_ui_menu_serialize_tree_data($item_value['below']);
    }
    $result[] = $item;
  }
  //dpm($data);
  //dpm($result);

  return $result;
}



function _liftoff_ui_menu_serialize_item_data($menu_item, $node = NULL) {
  $item = new stdClass;
  $item->id = $menu_item['mlid'];
  $item->parent = $menu_item['plid'];
  $item->weight = $menu_item['weight'];
  $item->title = $menu_item['link_title'];
  $item->path = url($menu_item['link_path']);
  $item->url = $item->path;

  if (empty($node->nid)) {
    $load_functions = unserialize($menu_item['load_functions']);
    if (!empty($load_functions) && $load_functions[1] == 'node_load') {
      $page_arguments = unserialize($menu_item['page_arguments']);
      $node = node_load($page_arguments[0]);
    } 
  }
  if (!empty($node->nid)) {
    $item->user = $node->uid;
    $item->type = $node->type;
    $item->status = !empty($node->workbench_moderation) ? $node->workbench_moderation['current']->from_state : 'draft';
    $item->gdriveFile = !empty($item->gdriveFile) ? json_decode($node->field_file_metadata[LANGUAGE_NONE][0]['value']) : null;
    if (!empty($item->gdriveFile) && $node->type == 'gdrive') {
      $item->path = $item->gdriveFile['url'];
    }
    $item->linkUrl = !empty($node->field_url) ? $node->field_url[LANGUAGE_NONE][0]['url'] : null;
    if (!empty($item->linkUrl) && $node->type == 'link') {
      $item->path = $item->linkUrl;
    }
  }
  return $item;
}


function _liftoff_ui_import($url, $args = array()) {
  $return = array();
  $url_parts = parse_url($url);
  $url_base = $url_parts['scheme'] . '://' . $url_parts['host'];
  $args['xpath'] = !empty($args['xpath']) ? $args['xpath'] : variable_get('liftoff_ui_xpath', '//body');
  $dom = new DomDocument;
  $dom->loadHTMLFile($url);
  $xpath = new DomXPath($dom);

  // Save image
  dpm(variable_get('liftoff_ui_xpath_image', NULL));
  if ($file = _liftoff_ui_save_file_query($xpath, variable_get('liftoff_ui_xpath_image', NULL), $url_base)) {
    $return['image'] = $file;
    dpm($file);
  }

  // Exclude html
  $exclude_xpath = variable_get('liftoff_ui_xpath_exclude', '');
  if (!empty($exclude_xpath)) {
    foreach($xpath->query($exclude_xpath) as $node) {
      $node->parentNode->removeChild($node);
    }
  }
  // Legacy images
  _liftoff_ui_save_file_query($xpath, '//img[@src]', $url_base);

  // @todo: Deal with legacy images (see baltimore)
  $body = '';
  foreach ($xpath->query($args['xpath']) as $i => $node) {
    $body .= $node->ownerDocument->saveHTML($node);
  }
  $body1=$body;
  $body = check_markup($body, 'imported');
  $return['content'] = $body;
  dpm(array('old'=>$body1, 'new'=>$body));
  dpm($return);
  return $return;
}

// From http://stackoverflow.com/questions/9082121/programmatically-save-image-from-external-url-drupal
function _liftoff_ui_save_file($url, $destination) {
  $filename = basename($url);
  $url = str_replace(' ', '%20', $url);
  // @todo: break apart the url and use urlencode()?
  //$url = urlencode($url);
  // @tood: check mimetype?
  //$type = get_headers($url, 1)["Content-Type"];
  //if (in_array($type, array('application/pdf'))) {
    /*$directory = file_build_uri('public://legacy');
    if (!file_prepare_directory($directory, FILE_CREATE_DIRECTORY)) {
      $directory = NULL;
    }*/
    $file = system_retrieve_file($url, $destination, TRUE);
    if (!empty($file->fid)) {
      $file->filename = $filename;
      try {
        file_save($file);
      }
      catch (Exception $e) {
        dpm('could not save file');
        dpm($file);
      }
      
    }
    return $file;
  //}
  // @todo: Record this somewhere that we'll need to update this link?
  return FALSE;
}


function _liftoff_ui_save_file_query($xpath, $query, $base_url, $destination) {
  if (!empty($query)) {
    $files = array();
    foreach($xpath->query($query) as $node) {
      $url = $node->getAttribute('src');
      if (substr($url, 0, 2) === '//') {
        $url = 'http:' . $url;
      }     
      if (strpos($url, $base_url) === FALSE && strpos($url, 'http') === FALSE) {
        $url = $base_url . $url;
      }     
      $file = _liftoff_ui_save_file($url, !empty($destination) ? $destination : 'public://');
      dpm($url);
      $node->parentNode->removeChild($node);
      /*$node->setAttribute('src', '/file/'.$file->fid);
      $node->setAttribute('class', 'legacy-image');*/
      $row->image = $file;
      $files[] = $file;
    }
    return is_array($files) ? $files[0] : FALSE;
  }
}

/*
    "id": 1,
    "title": "About",
    "user": "aschmoe",
    "type": "overview",
    "status": "draft",

*/