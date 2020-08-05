import os

platform = "win32"

config = {
    "repack_id": os.environ.get("REPACK_ID"),

    'run_configure': False,

    'env': {
        'PATH': "%(abs_input_dir)s/upx/bin:%(PATH)s",
    }
}
