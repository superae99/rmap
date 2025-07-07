#!/bin/bash

# Execute all SQL files in order
echo 'Starting database update...'

echo 'Executing partners_batch_1.sql...'
platform db:sql < partners_batch_1.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_1.sql'
    exit 1
fi

echo 'Executing partners_batch_2.sql...'
platform db:sql < partners_batch_2.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_2.sql'
    exit 1
fi

echo 'Executing partners_batch_3.sql...'
platform db:sql < partners_batch_3.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_3.sql'
    exit 1
fi

echo 'Executing partners_batch_4.sql...'
platform db:sql < partners_batch_4.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_4.sql'
    exit 1
fi

echo 'Executing partners_batch_5.sql...'
platform db:sql < partners_batch_5.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_5.sql'
    exit 1
fi

echo 'Executing partners_batch_6.sql...'
platform db:sql < partners_batch_6.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_6.sql'
    exit 1
fi

echo 'Executing partners_batch_7.sql...'
platform db:sql < partners_batch_7.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_7.sql'
    exit 1
fi

echo 'Executing partners_batch_8.sql...'
platform db:sql < partners_batch_8.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_8.sql'
    exit 1
fi

echo 'Executing partners_batch_9.sql...'
platform db:sql < partners_batch_9.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_9.sql'
    exit 1
fi

echo 'Executing partners_batch_10.sql...'
platform db:sql < partners_batch_10.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_10.sql'
    exit 1
fi

echo 'Executing partners_batch_11.sql...'
platform db:sql < partners_batch_11.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_11.sql'
    exit 1
fi

echo 'Executing partners_batch_12.sql...'
platform db:sql < partners_batch_12.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_12.sql'
    exit 1
fi

echo 'Executing partners_batch_13.sql...'
platform db:sql < partners_batch_13.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_13.sql'
    exit 1
fi

echo 'Executing partners_batch_14.sql...'
platform db:sql < partners_batch_14.sql
if [ $? -ne 0 ]; then
    echo 'Error executing partners_batch_14.sql'
    exit 1
fi

echo 'Database update completed successfully!'
