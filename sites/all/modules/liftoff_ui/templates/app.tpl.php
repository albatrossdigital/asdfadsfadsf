<div ng-app="drupalNgUiApp" ng-init="init('<? print $api_path ?>')">
  <base href="<?php print $app_path ?>" />
  <div ui-view=""></div>
</div>