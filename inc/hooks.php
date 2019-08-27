<?php
/**
 * Custom hooks.
 *
 * @package themebase
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'themebase_site_info' ) ) {
	/**
	 * Add site info hook to WP hook library.
	 */
	function themebase_site_info() {
		do_action( 'themebase_site_info' );
	}
}

if ( ! function_exists( 'themebase_add_site_info' ) ) {
	add_action( 'themebase_site_info', 'themebase_add_site_info' );

	/**
	 * Add site info content.
	 */
	function themebase_add_site_info() {
		$the_theme = wp_get_theme();

		$site_info = sprintf(
			'<a href="%1$s">%2$s</a><span class="sep"> | </span>%3$s(%4$s)',
			esc_url( __( 'http://wordpress.org/', 'themebase' ) ),
			sprintf(
				/* translators:*/
				esc_html__( 'Proudly powered by %s', 'themebase' ),
				'WordPress'
			),
			sprintf( // WPCS: XSS ok.
				/* translators:*/
				esc_html__( 'Theme: %1$s by %2$s.', 'themebase' ),
				$the_theme->get( 'Name' ),
				'<a href="' . esc_url( __( 'http://themebase.com', 'themebase' ) ) . '">themebase.com</a>'
			),
			sprintf( // WPCS: XSS ok.
				/* translators:*/
				esc_html__( 'Version: %1$s', 'themebase' ),
				$the_theme->get( 'Version' )
			)
		);

		echo apply_filters( 'themebase_site_info_content', $site_info ); // WPCS: XSS ok.
	}
}
