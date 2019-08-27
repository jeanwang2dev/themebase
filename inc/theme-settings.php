<?php
/**
 * Check and setup theme's default settings
 *
 * @package themebase
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'themebase_setup_theme_default_settings' ) ) {
	function themebase_setup_theme_default_settings() {

		// check if settings are set, if not set defaults.
		// Caution: DO NOT check existence using === always check with == .
		// Latest blog posts style.
		$themebase_posts_index_style = get_theme_mod( 'themebase_posts_index_style' );
		if ( '' == $themebase_posts_index_style ) {
			set_theme_mod( 'themebase_posts_index_style', 'default' );
		}

		// Sidebar position.
		$themebase_sidebar_position = get_theme_mod( 'themebase_sidebar_position' );
		if ( '' == $themebase_sidebar_position ) {
			set_theme_mod( 'themebase_sidebar_position', 'right' );
		}

		// Container width.
		$themebase_container_type = get_theme_mod( 'themebase_container_type' );
		if ( '' == $themebase_container_type ) {
			set_theme_mod( 'themebase_container_type', 'container' );
		}
	}
}
