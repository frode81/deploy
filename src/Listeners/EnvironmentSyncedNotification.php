<?php

namespace Deploy\Listeners;

use Deploy\Events\EnvironmentSynced;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class EnvironmentSyncedNotification
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  EnvironmentSynced  $event
     * @return void
     */
    public function handle(EnvironmentSynced $event)
    {
        //
    }
}
