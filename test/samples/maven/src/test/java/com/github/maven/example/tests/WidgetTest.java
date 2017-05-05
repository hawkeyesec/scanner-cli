package com.github.maven.example.tests;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.github.maven.example.Widget;

import org.junit.Test;

/**
 * Unit tests of {@link Widget} class
 */
public class WidgetTest {

	/**
	 * Test default enable state of {@link Widget}
	 */
	@Test
	public void defaultState() {
		Widget widget = new Widget();
		assertTrue(widget.isEnabled());
	}

	/**
	 * Test enabling and disabling a {@link Widget}
	 */
	@Test
	public void updateEnableState() {
		Widget widget = new Widget();
		widget.setEnabled(false);
		assertFalse(widget.isEnabled());
		widget.setEnabled(true);
		assertTrue(widget.isEnabled());
	}
}
