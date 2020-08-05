import os

platform = "win64"

config = {
    "locale": os.environ.get("LOCALE"),

    'run_configure': False,

    'env': {
        'PATH': "%(abs_input_dir)s/upx/bin:%(PATH)s",
    }
}
