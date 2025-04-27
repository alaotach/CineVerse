cmake_minimum_required(VERSION 3.10)
project(cinema_engine)

# Set C++ standard to C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Check if pybind11 is installed directly in the system
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# If not found, try to find it in the third-party directory
if(NOT pybind11_FOUND)
    # Add third-party directory
    add_subdirectory("${CMAKE_CURRENT_SOURCE_DIR}/third_party/pybind11" EXCLUDE_FROM_ALL)
endif()

# Create third-party directory if it doesn't exist
if(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/third_party")
    file(MAKE_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/third_party")
endif()

# Create JSON for Modern C++ directory if it doesn't exist
if(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/third_party/json")
    file(MAKE_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/third_party/json")
endif()

# Check if nlohmann/json.hpp exists, if not download it
if(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/third_party/json/include/nlohmann/json.hpp")
    file(MAKE_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/third_party/json/include/nlohmann")
    file(DOWNLOAD
        "https://raw.githubusercontent.com/nlohmann/json/develop/single_include/nlohmann/json.hpp"
        "${CMAKE_CURRENT_SOURCE_DIR}/third_party/json/include/nlohmann/json.hpp"
        SHOW_PROGRESS
    )
endif()

# Add the nlohmann/json include directory
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/third_party/json/include")
add_subdirectory(extern/pybind11)

# Add the pybind11 module
pybind11_add_module(cinema_engine cinema_engine.cpp)

# Install the library
install(TARGETS cinema_engine DESTINATION .)