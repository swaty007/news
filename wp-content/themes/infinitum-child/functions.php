<?php

define( 'PARSER_SITR_TYPE', 'INFINITUM' );
require_once get_theme_file_path('../parser-core/functions.php');


function removeDuplicates()
{
    foreach (pll_languages_list() as $lang) {
        $data = [];
        $posts = get_posts([
            'post_type' => 'post',
            'post_status' => ['publish', 'draft'],
            'posts_per_page' => -1,
            'lang' => $lang,
        ]);
        foreach ($posts as $post) {
            $post_id = $post->ID;
//            $sku = get_post_meta($post_id, 'post_title', true);
            $sku = $post->post_title;
            if (in_array($sku, $data)) {
                wp_delete_post($post_id);
            } else {
                $data[] = $sku;
            }
        }
    }
    var_dump('removes');
}
//add_action('init', 'removeDuplicates', 69);