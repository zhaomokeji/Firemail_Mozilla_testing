# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from __future__ import absolute_import

from marionette_driver.errors import JavascriptException

from marionette_harness import MarionetteTestCase, WindowManagerMixin


class TestSwitchFrameChrome(WindowManagerMixin, MarionetteTestCase):

    def setUp(self):
        super(TestSwitchFrameChrome, self).setUp()
        self.marionette.set_context("chrome")

        new_window = self.open_chrome_window("chrome://marionette/content/test.xhtml")
        self.marionette.switch_to_window(new_window)
        self.assertNotEqual(self.start_window, self.marionette.current_chrome_window_handle)

    def tearDown(self):
        self.close_all_windows()
        super(TestSwitchFrameChrome, self).tearDown()

    def test_switch_simple(self):
        self.assertIn("test.xhtml", self.marionette.get_url(), "Initial navigation has failed")
        self.marionette.switch_to_frame(0)
        self.assertIn("test2.xhtml", self.marionette.get_url(), "Switching by index failed")
        iframe_element = self.marionette.get_active_frame()
        self.marionette.switch_to_frame()
        self.assertEqual(None, self.marionette.get_active_frame(), "Switching by null failed")
        self.assertIn("test.xhtml", self.marionette.get_url(), "Switching by null failed")
        self.marionette.switch_to_frame(iframe_element)
        self.assertIn("test2.xhtml", self.marionette.get_url(), "Switching by element failed")

    def test_stack_trace(self):
        self.assertIn("test.xhtml", self.marionette.get_url(), "Initial navigation has failed")
        self.marionette.switch_to_frame(0)
        self.assertRaises(JavascriptException, self.marionette.execute_async_script, "foo();")
        try:
            self.marionette.execute_async_script("foo();")
        except JavascriptException as e:
            self.assertIn("foo", str(e))
