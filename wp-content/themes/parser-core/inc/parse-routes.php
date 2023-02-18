<?php

add_action('rest_api_init', 'parserRegisterRoute');

function parserRegisterRoute()
{
    register_rest_route('parse/v1', 'insert', array(
        'methods' => WP_REST_SERVER::CREATABLE,
        'callback' => 'insertResult',
    ));
    register_rest_route('parse/v1', 'unique', array(
        'methods' => WP_REST_SERVER::CREATABLE,
        'callback' => 'uniqueTest',
    ));
}

function uniqueTest($request)
{
    $json_parsed = $request->get_json_params();

    $imageurl = $json_parsed['image']['guid'];

    $postFinded = get_page_by_title($json_parsed['post_title'], OBJECT, ['post', 'attachment']);
//    $imgFinded = get_page_by_title(pathinfo(basename($imageurl), PATHINFO_FILENAME), OBJECT, ['post', 'attachment']);
//    $imgFinded2 = get_page_by_title($json_parsed['image']['post_title'], OBJECT, ['post', 'attachment']);
//    if (!empty($postFinded) || !empty($imgFinded) || !empty($imgFinded2)) {
    if (!empty($postFinded)) {
        wp_send_json(true);
    } else {
        wp_send_json(false);
    }
}

function insertResult($request)
{
    try {
//        require_once(ABSPATH . '/wp-admin/includes/taxonomy.php');
//        wp_send_json([
//            'get_term_by'=>get_term_by('ID', 15837, 'category')->term_id,
//            'pll_get_term(46, $language)' => pll_get_term(15837, 'uk')
//        ]);
        $json_parsed = $request->get_json_params();
        $langMain = $request->get_header('lang');
        if (empty($json_parsed)) {
            wp_send_json(false);
            return;
        }

        $attach_id = null;
        $main_post_id = null;
        $posts = [];
        $languages = [
            'uk',
            'en',
            'ru',
            'da',
            'nb',
            'zh',
            'pl',
            'de',
        ];
        $category = [
            'uk' => [],
            'en' => [],
            'ru' => [],
            'da' => [],
            'nb' => [],
            'zh' => [],
            'pl' => [],
            'de' => [],
        ];
        if (!empty($json_parsed[$langMain]['categories'])) {
            require_once(ABSPATH . '/wp-admin/includes/taxonomy.php');
            for ($i = 0; $i < count($json_parsed[$langMain]['categories']); $i++) {
                $arrSave = [];
                foreach($languages as $language) {
                    if (!empty($json_parsed[$language])) {
                        $catId = get_term_by('name', $json_parsed[$language]['categories'][$i], 'category');
                        if (!empty($catId)) {
                            $catId = pll_get_term($catId->term_id, $language);
                        }
                        if(empty($catId)) {
                            switch (PARSER_SITR_TYPE){
                                case "INFINITUM":
                                    $parentCategory = pll_get_term(46, $language);
                                    break;
                                case "DMG":
                                    $parentCategory = pll_get_term(46, $language);
                                    break;
                            }

                            $catId = wp_insert_category([
                                'cat_name' => $json_parsed[$language]['categories'][$i],
                                'category_parent' => $parentCategory,
                            ]);
                        }
                        $category[$language][] = $catId;
                        $arrSave[$language] = $catId;
                    }
                }
                pll_save_term_translations($arrSave);
            }
        }
        foreach ($json_parsed as $lang => $item) {
            if (empty($attach_id)) {
                $attach_id = !empty($item['image']['guid']) ? create_attachment($item['image']) : 315; //default
            }
            $post_id = createPost($item, in_array($lang, [$langMain]), $category[$lang]);
            set_post_thumbnail($post_id, $attach_id);
            pll_set_post_language($post_id, $lang);
//            if ($lang !== 'da' || $lang !== 'nb') {
            $posts[$lang] = $post_id;
//            } else {
//                $main_post_id = $post_id;
//            }
        }
        pll_save_post_translations($posts);
        wp_send_json(true);
    } catch (Exception $e) {
        wp_send_json(false);
    }
}
