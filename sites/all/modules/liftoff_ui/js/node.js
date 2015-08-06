(function($){


  Drupal.behaviors.soar_admin_ui = {
    attach: function (context, settings) {
      
      // Detect contextual links on entities annotated by Quick Edit; queue
      // these to be processed.
      // Code from quickedit.js
      $(context).find('.tabs--primary li a[href$="/quickedit"').once('soar-quickedit-contextual').each(function (index, $element) {
        $(this).parents('li').addClass('contextual-links');
        
        $node = $('.region-content .node');
        $(this).parents('ul')
          .addClass('contextual-links-region')
          .attr('data-quickedit-entity-id', $node.attr('data-quickedit-entity-id'))
          .attr('about', $node.attr('about'))
          .attr('typeof', $node.attr('typeof'))
          .attr('data-quickedit-entity-instance-id', $node.attr('data-quickedit-entity-instance-id'));
      });

    }
  };
})(jQuery);

