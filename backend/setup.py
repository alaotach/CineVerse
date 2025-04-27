from setuptools import setup, Extension
import pybind11
import os
import sys

# Adjust compiler flags for different platforms
extra_compile_args = []
extra_link_args = []

if sys.platform == 'win32':
    extra_compile_args.append('/std:c++17')  # Windows
    # Add OpenMP support for Windows
    extra_compile_args.append('/openmp')
else:
    extra_compile_args.append('-std=c++17')  # Linux and macOS
    # Add OpenMP support for Linux and macOS
    extra_compile_args.append('-fopenmp')
    extra_link_args.append('-fopenmp')

# Define the extension module
ext_modules = [
    Extension(
        'cinema_engine',
        ['src/cinema_engine.cpp'],
        include_dirs=[pybind11.get_include()],
        language='c++',
        extra_compile_args=extra_compile_args,
        extra_link_args=extra_link_args,
    ),
]

setup(
    name="cinema_engine",
    version="0.1.0",
    author="CineVerse Team",
    author_email="support@cineverse.com",
    description="C++ backend for CineVerse booking system",
    ext_modules=ext_modules,
    zip_safe=False,
    python_requires=">=3.7",
)
