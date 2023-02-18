<?php

require_once get_theme_file_path('../parser-core/inc/parse-routes.php');
//require_once get_theme_file_path('../parser-core/inc/polylang-slug.php');


add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );
function my_theme_enqueue_styles() {
    $parenthandle = 'parent-style'; // This is 'twentyfifteen-style' for the Twenty Fifteen theme.
    $theme        = wp_get_theme();
    wp_enqueue_style( $parenthandle,
        get_template_directory_uri() . '/style.css',
        array(),  // If the parent theme code has a dependency, copy it to here.
        $theme->parent()->get( 'Version' )
    );
}

function createPost ($post, $private = false, $category = []) {
    $post_id =  wp_insert_post(array(
        'post_type' => 'post',
        'post_title' => $post['post_title'],
        'post_content' =>  html_entity_decode($post['post_content']),
        'post_date_gmt' => empty($post['post_date_gmt']) ? '' : $post['post_date_gmt'],
        'post_excerpt' => $post['post_excerpt'],
//	'post_name'      => <the name>,
        'post_author'   => 2,
        'post_status' => $private ? 'draft' : 'publish',
        'post_category' => $category,
        'tags_input' => $post['tags'],
    ));
    wp_set_post_categories($post_id, $category, true);
//    wp_set_post_categories($post_id, $post['categories'], true);
    wp_set_object_terms($post_id, $category, 'category', true);
//    wp_set_object_terms($post_id, $post['categories'], 'category', true);
//    wp_set_post_terms

    //$attachment_id = media_handle_upload('image', $post_id);
//set_post_thumbnail( $post_id, $attachment_id );
    return $post_id;
}
function create_attachment ($attach) {
//    $file_name = basename( $file_path );
//    $file_type = wp_check_filetype( $file_name, null );
//    $attachment_title = sanitize_file_name( pathinfo( $file_name, PATHINFO_FILENAME ) );
    include_once( ABSPATH . 'wp-admin/includes/image.php' );
    $imageurl = $attach['guid'];
    $attachTitle = !empty($attach['post_title']) ? $attach['post_title'] : pathinfo(basename($imageurl), PATHINFO_FILENAME);
    $attackTitle = preg_replace('/[^0-9a-z-]/i', '', sanitize_file_name($attachTitle));
    $imagesize = explode('/', getimagesize($imageurl)['mime']);
    $imagetype = end($imagesize);
//        $uniq_name = date('dmY').''.(int) microtime(true);
    $uploaddir = wp_upload_dir();
    $filename = wp_unique_filename($uploaddir['path'],$attachTitle.'.'.$imagetype);
    $uploadfile = $uploaddir['path'] . '/' . $filename;
    $contents = file_get_contents($imageurl);
    if (file_exists($uploadfile)) {
        $filename = $attachTitle . date('dmY').'.'.$imagetype;
        $uploadfile = $uploaddir['path'] . '/' . $filename;
    }
    $savefile = fopen($uploadfile, 'w');
    fwrite($savefile, $contents);
    fclose($savefile);
    $wp_filetype = wp_check_filetype(basename($filename), null );
    $attachment = array(
//            'guid' => $uploaddir . '/' . basename( $filename ),
        'post_mime_type' => $wp_filetype['type'],
        'post_title' => $attachTitle,
        'post_content' => '',
        'post_status' => 'inherit'
    );
    $attach_id = wp_insert_attachment( $attachment, $uploadfile );
    $imagenew = get_post( $attach_id );
    $fullsizepath = get_attached_file( $imagenew->ID );
    $attach_data = wp_generate_attachment_metadata( $attach_id, $fullsizepath );
//    unset($attach_data['sizes']);
    wp_update_attachment_metadata( $attach_id, $attach_data );

    return $attach_id;
}


add_filter( 'the_content', 'updatePostContent', 1000);

function updatePostContent( $content ) {
    global $post;
    $lang = pll_get_post_language($post->ID);
    $posts = get_posts([
        'post_type' => 'post',
        'post_status' => ['publish'],
        'posts_per_page' => -1,
        'lang' => $lang,
    ]);
    foreach($posts as $item) {
        if ($item->ID === $post->ID) continue;
//        $titles = explode('.', $post->post_title);
//        foreach($titles as $title) {
//            $res = strpos($content, $title);
//            if ($res) {
//                var_dump($title);
//            }
//        }
        $words = explode(" ", $item->post_title);
        $groups = array();
        for ($i = 0; $i < count($words); $i += 4) {
            $group = array_slice($words, $i, 4);
            $groups[] = implode(" ", $group);
        }

        foreach ($groups as $group) {
            if (strpos($content, $group) && mb_strlen(trim($group)) > 10) {
                $content = str_replace($group, "<a href='" . get_permalink($item) . "' target='_blank'>$group</a>", $content);
            }
        }


    }
//        $similarity = cosineSimilarity($post->post_title, $content);
//        if (round($similarity, 2) > 1) {
//            var_dump($post->post_title);
//        }

//    $title = "Это текст статьи";
//    $contents = "Это текст статьи. Он может состоять из нескольких абзацев. В нем могут быть ссылки и другие элементы разметки.";
//    $similarity = cosineSimilarity($title, $contents);
//    var_dump(round($similarity, 2));
    return $content;
}


function cosineSimilarity($text1, $text2) {
    // Переводим тексты в массивы токенов
    $tokens1 = tokenize($text1);
    $tokens2 = tokenize($text2);
    // Создаем общий набор токенов
    $tokens = array_unique(array_merge($tokens1, $tokens2));
    // Создаем векторы для каждого текста
    $vector1 = array();
    $vector2 = array();
    foreach ($tokens as $token) {
        // Вычисляем количество вхождений токена в каждом тексте
        $count1 = count(array_keys($tokens1, $token));
        $count2 = count(array_keys($tokens2, $token));
        // Добавляем значение вектора для каждого текста
        array_push($vector1, $count1);
        array_push($vector2, $count2);
    }
    // Вычисляем длины векторов
    $length1 = sqrt(array_reduce($vector1, function($carry, $value) {
        return $carry + pow($value, 2);
    }, 0));
    $length2 = sqrt(array_reduce($vector2, function($carry, $value) {
        return $carry + pow($value, 2);
    }, 0));
    // Вычисляем косинусное сходство
    $dotProduct = array_reduce($vector1, function($carry, $value) use ($vector1, $vector2) {
        $key = array_search($value, $vector1);
        return $carry + ($value * $vector2[$key]);
    }, 0);
    $cosineSimilarity = $dotProduct / ($length1 * $length2);
    return $cosineSimilarity;
}

function tokenize($text) {
    // Удаляем знаки препинания и приводим к нижнему регистру
//    $text = preg_replace("/[^a-z0-9]+/i", " ", $text);
//    $text = strtolower(trim($text));
    // Разбиваем на слова и возвращаем массив
//    return explode(" ", $text);
    $text = preg_replace("/[^\p{L}\p{N}]+/u", " ", $text);
    $text = mb_strtolower(trim($text), 'UTF-8');
    // Разбиваем на слова и возвращаем массив
    return preg_split("/\s+/u", $text);
}


// thumbnail disable start
function shapeSpace_customize_image_sizes($sizes) {
    unset($sizes['thumbnail']);    // disable thumbnail size
    unset($sizes['medium']);       // disable medium size
    unset($sizes['large']);        // disable large size
    unset($sizes['medium_large']); // disable medium-large size
    unset($sizes['1536x1536']);    // disable 2x medium-large size
    unset($sizes['2048x2048']);    // disable 2x large size
    return $sizes;
}
add_filter('intermediate_image_sizes_advanced', 'shapeSpace_customize_image_sizes');
// disable scaled image size
add_filter('big_image_size_threshold', '__return_false');

// disable other image sizes
function shapeSpace_disable_other_image_sizes() {
    remove_image_size('post-thumbnail'); // disable images added via set_post_thumbnail_size()
//    remove_image_size('another-size');   // disable any other added image sizes
}
add_action('init', 'shapeSpace_disable_other_image_sizes');
// disable srcset on frontend
function disable_wp_responsive_images() {
    return 1;
}
add_filter('max_srcset_image_width', 'disable_wp_responsive_images');
// thumbnail disable end

add_filter( 'avatar_defaults', 'wpb_new_gravatar' );
function wpb_new_gravatar ($avatar_defaults) {
    switch (PARSER_SITR_TYPE){
        case "INFINITUM":
            $myavatar = wp_get_attachment_url(504);
            $avatar_defaults[$myavatar] = "Infinitum Gravatar";
            break;
        case "DMG":
            $myavatar = wp_get_attachment_url(5);
            $avatar_defaults[$myavatar] = "DMG Gravatar";
            break;
    }
    return $avatar_defaults;
}


// OPTI START
add_filter( 'comment_text', 'remove_html_from_comments' );
function remove_html_from_comments( $comment_text ) {
    return htmlspecialchars($comment_text);
}
function cc_mime_types($mime_types) {
    $mime_types['svg'] = 'image/svg+xml';
//    $mime_types['svg'] = 'image/svg';
    return $mime_types;
}
add_filter('upload_mimes', 'cc_mime_types');

//add_filter('script_loader_tag', 'add_async_attribute', 49, 3);
function add_async_attribute($tag, $handle, $src) {
    if(is_admin()) {return $tag;}
    // добавьте дескрипторы (названия) скриптов в массив ниже
    $scripts_to_async = array('jquery-core');
    foreach($scripts_to_async as $async_script) {
        if ($async_script === $handle) {
            return str_replace(' src', ' src', $tag);
        } else {
            return str_replace(' src', ' defer src', $tag);
        }
    }
    return $tag;
}

//Disable REST API link tag
remove_action('wp_head', 'rest_output_link_wp_head', 10);
//Disable oEmbed Discovery Links
remove_action('wp_head', 'wp_oembed_add_discovery_links', 10);
//Disable REST API link in HTTP headers
remove_action('template_redirect', 'rest_output_link_header', 11, 0);
remove_action('wp_head','feed_links_extra', 3); // убирает ссылки на rss категорий
remove_action('wp_head','feed_links', 2); // минус ссылки на основной rss и комментарии
remove_action('wp_head','rsd_link');  // сервис Really Simple Discovery
remove_action('wp_head','wlwmanifest_link'); // Windows Live Writer
remove_action('wp_head','wp_generator');  // скрыть версию wordpress

add_filter('after_setup_theme', 'remove_redundant_shortlink');
function remove_redundant_shortlink() {
    // remove HTML meta tag
    // <link rel='shortlink' href='http://example.com/?p=25' />
    remove_action('wp_head', 'wp_shortlink_wp_head', 10);

    // remove HTTP header
    // Link: <https://example.com/?p=25>; rel=shortlink
    remove_action( 'template_redirect', 'wp_shortlink_header', 11);
}

add_action( 'after_setup_theme', 'footer_enqueue_scripts' );
function footer_enqueue_scripts() {
    if(is_admin()) {return;}
    remove_action('wp_enqueue_scripts', 'ls_load_google_fonts'); //remove google fonts
    remove_action('admin_enqueue_scripts', 'ls_load_google_fonts'); //remove google fonts


    remove_action('wp_head', 'download_rss_link'); //RRS meta

    remove_action('wp_head', 'wp_print_scripts');
    remove_action('wp_head', 'wp_enqueue_scripts', 2);
//  remove_action('wp_head', 'wp_print_styles',8);
    remove_action('wp_head', 'wp_print_head_scripts', 9);
//    wp_enqueue_style
//    style_loader_tag
    add_action('wp_footer','wp_print_scripts',4);
    add_action('wp_footer','wp_enqueue_scripts',5);
//  add_action('wp_footer','wp_print_styles',6);
    add_action('wp_footer','wp_print_head_scripts',7);

}


// OPTI AND