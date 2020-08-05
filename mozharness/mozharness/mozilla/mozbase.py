import os
from mozharness.base.script import PreScriptAction


class MozbaseMixin(object):
    """Automatically set virtualenv requirements to use mozbase
       from test package.
    """
    def __init__(self, *args, **kwargs):
        super(MozbaseMixin, self).__init__(*args, **kwargs)

    @PreScriptAction('create-virtualenv')
    def _install_mozbase(self, action):
        dirs = self.query_abs_dirs()

        requirements = os.path.join(
            dirs['abs_test_install_dir'],
            'config',
            self.config.get('mozbase_requirements', 'mozbase_requirements.txt')
        )
        if not os.path.isfile(requirements):
            self.fatal(
                "Could not find mozbase requirements file: {}".format(requirements)
            )

        self.register_virtualenv_module(requirements=[requirements], two_pass=True)
