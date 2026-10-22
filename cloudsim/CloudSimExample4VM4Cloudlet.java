import org.cloudbus.cloudsim.*;
import org.cloudbus.cloudsim.core.CloudSim;
import org.cloudbus.cloudsim.provisioners.BwProvisionerSimple;
import org.cloudbus.cloudsim.provisioners.PeProvisionerSimple;
import org.cloudbus.cloudsim.provisioners.RamProvisionerSimple;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.LinkedList;
import java.util.List;

public class CloudSimExample4VM4Cloudlet {

    private static List<Cloudlet> cloudletList;
    private static List<Vm> vmList;

    public static void main(String[] args) {
        int numUsers = 1;
        Calendar calendar = Calendar.getInstance();
        boolean traceEvents = false;

        // Step 1: Initialize the CloudSim library
        CloudSim.init(numUsers, calendar, traceEvents);

        // Step 2: Create Datacenter
        @SuppressWarnings("unused")
        Datacenter datacenter0 = createDatacenter("Datacenter_0");

        // Step 3: Create Broker
        DatacenterBroker broker = createBroker();
        int brokerId = broker.getId();

        // Step 4: Create 4 VMs
        vmList = new ArrayList<Vm>();
        
        // VM parameters
        int mips = 1000;
        long size = 10000; // image size (MB)
        int ram = 2048; // vm memory (MB)
        long bw = 1000;
        int pesNumber = 1; // number of CPUs
        String vmm = "Xen"; // VMM name

        for (int i = 0; i < 4; i++) {
            Vm vm = new Vm(i, brokerId, mips, pesNumber, ram, bw, size, vmm, new CloudletSchedulerTimeShared());
            vmList.add(vm);
        }

        // Submit VM list to the broker
        broker.submitVmList(vmList);

        // Step 5: Create 4 Cloudlets
        cloudletList = new ArrayList<Cloudlet>();

        // Cloudlet parameters
        long length = 400000;
        long fileSize = 300;
        long outputSize = 300;
        UtilizationModel utilizationModel = new UtilizationModelFull();

        for (int i = 0; i < 4; i++) {
            Cloudlet cloudlet = new Cloudlet(i, length, pesNumber, fileSize, outputSize, 
                                             utilizationModel, utilizationModel, utilizationModel);
            cloudlet.setUserId(brokerId);
            // Optionally bind each cloudlet explicitly to a specific VM
            cloudlet.setVmId(i); 
            cloudletList.add(cloudlet);
        }

        // Submit Cloudlet list to the broker
        broker.submitCloudletList(cloudletList);

        // Step 6: Starts the simulation
        CloudSim.startSimulation();

        CloudSim.stopSimulation();

        // Step 7: Print results when simulation is over
        List<Cloudlet> newList = broker.getCloudletReceivedList();
        printCloudletList(newList);
    }

    private static Datacenter createDatacenter(String name) {
        List<Host> hostList = new ArrayList<Host>();
        List<Pe> peList = new ArrayList<Pe>();

        int mips = 10000;

        // Create PEs (Processing Elements / CPU Cores)
        peList.add(new Pe(0, new PeProvisionerSimple(mips)));
        peList.add(new Pe(1, new PeProvisionerSimple(mips)));
        peList.add(new Pe(2, new PeProvisionerSimple(mips)));
        peList.add(new Pe(3, new PeProvisionerSimple(mips)));

        // Create Host
        int hostId = 0;
        int ram = 16384; // host memory (MB)
        long storage = 1000000; // host storage
        int bw = 100000;

        hostList.add(
            new Host(
                hostId,
                new RamProvisionerSimple(ram),
                new BwProvisionerSimple(bw),
                storage,
                peList,
                new VmSchedulerTimeShared(peList)
            )
        );

        // Datacenter characteristics
        String arch = "x86";
        String os = "Linux";
        String vmm = "Xen";
        double time_zone = 10.0;
        double cost = 3.0;
        double costPerMem = 0.05;
        double costPerStorage = 0.1;
        double costPerBw = 0.1;

        LinkedList<Storage> storageList = new LinkedList<Storage>();

        DatacenterCharacteristics characteristics = new DatacenterCharacteristics(
                arch, os, vmm, hostList, time_zone, cost, costPerMem, costPerStorage, costPerBw);

        Datacenter datacenter = null;
        try {
            datacenter = new Datacenter(name, characteristics, new VmAllocationPolicySimple(hostList), storageList, 0);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return datacenter;
    }

    private static DatacenterBroker createBroker() {
        DatacenterBroker broker = null;
        try {
            broker = new DatacenterBroker("Broker");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return broker;
    }

    private static void printCloudletList(List<Cloudlet> list) {
        int size = list.size();
        Cloudlet cloudlet;

        String indent = "    ";
        System.out.println();
        System.out.println("========== OUTPUT ==========");
        System.out.println("Cloudlet ID" + indent + "STATUS" + indent +
                "Data center ID" + indent + "VM ID" + indent + "Time" + indent + "Start Time" + indent + "Finish Time");

        DecimalFormat dft = new DecimalFormat("###.##");
        for (int i = 0; i < size; i++) {
            cloudlet = list.get(i);
            System.out.print(indent + cloudlet.getCloudletId() + indent + indent);

            if (cloudlet.getCloudletStatus() == Cloudlet.SUCCESS) {
                System.out.print("SUCCESS");

                System.out.println(indent + indent + cloudlet.getResourceId() + indent + indent + indent + cloudlet.getVmId()
                        + indent + indent + dft.format(cloudlet.getActualCPUTime()) + indent + indent + dft.format(cloudlet.getExecStartTime())
                        + indent + indent + dft.format(cloudlet.getFinishTime()));
            }
        }
    }
}