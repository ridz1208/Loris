<div id="demographics">
    <h2 class="statsH2">General statistics{if $CurrentSite} for {$CurrentSite.Name}{/if}
        {if $CurrentProject} for {$CurrentProject.Name} {/if}</h2>

    <div class="col-sm-2">
        {html_options id="DemographicSite" options=$Sites name="DemographicSite" selected=$CurrentSite.ID class="form-control"}
    </div>
    <div class="col-sm-3">
        {html_options id="DemographicProject" options=$Projects name="DemographicProject" selected=$CurrentProject.ID class="form-control"}
    </div>

    <script type="text/javascript" src="{$baseurl}/statistics/js/form_stats_demographic.js"></script>
    <button  onClick="updateDemographicTab()" class="btn btn-primary btn-small">Submit Query</button>
    <br><br>
    <table class="data generalStats table table-primary table-bordered">
        <thead>
        <tr>
            <th></th>
            <th>Undefined Yet</th>
            {foreach from=$Subprojects item=name key=proj}
                <th>{$name}</th>
            {/foreach}
            <th class="data">Total</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>Registered candidates</td>
            <td>{$registered[NULL].total}</td>
            {foreach from=$Subprojects item=proj key=keyid}
                <td>{$registered[$keyid].total}</td>
            {/foreach}
            {*
                <td class="total">{$registered.total}{if $registered.total-$Total_candidates neq 0} ({$Total_candidates -$registered.total} require DCC review){/if}</td>*}

            <td class="total">{$registered.total}</td>
        </tr>
        <tr>
            <td colspan="2">Registered candidates currently in or passed screening</td>
            {foreach from=$Subprojects item=proj key=keyid}
                <td>{$registered[$keyid].visit}</td>
            {/foreach}
            <td class="total">{$registered.visittotal}</td>
        </tr>
        <tr>
            <td colspan="2">Registered candidates who have come in for a visit</td>
            {foreach from=$Subprojects item=proj key=keyid}
                <td>{$edi[$keyid].complete}</td>
            {/foreach}
            <td class="total">{$edi.complete}</td>
        </tr>
        {if $mri_table_exists}
            <tr>
                <td colspan="2">Registered candidates with T1 acquired</td>
                {foreach from=$Subprojects item=proj key=keyid}
                    <td>{$scanned[$keyid].complete}</td>
                {/foreach}
                <td class="total">{$scanned.complete}</td>
            </tr>
        {/if}


        </tbody>
    </table>

    {$RecruitsTable}
</div>
