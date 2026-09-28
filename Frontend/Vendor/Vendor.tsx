// Vendors.tsx
import { Html, Text } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from '../colors';
import type {
  Vendor,
    VendorContract,
    VendorContractVarianceResponse,
    CreateVendorRequest,
    CreateVendorInvoiceRequest
} from './vendor';
import VendorForm from './components/VendorForm';
import VendorInvoiceForm from './components/VendorInvoiceForm';
import './Vendor.scss';
import '../scss/glow.scss';
import { VendorService } from './VendorService';
import VendorNetworkVisualization from './components/VendorNetworkVisualizations';
import ContractCrystalView from './components/ContractCrystalView';
import VendorList from './components/VendorList';
import { useAtom } from 'jotai';
import { vendorsDataAtom, loadingAtom } from '../atoms/dataAtoms';


const AddVendorButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <Html
    position={[4.5, 6.0, 1]}
    center
    transform
    style={{ width: '100px' }}
  >
    <button
      className="vendor-nav__add-btn"
      onClick={onClick}
      aria-label="Add vendor"
    >
      + Vendor
    </button>
  </Html>
));

const AddInvoiceButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <Html
    position={[-4.35, 9.6, 1.0]}
    center
    transform
    style={{ width: '120px' }}
  >
    <button
      className="vendor-nav__add-btn"
      onClick={onClick}
      aria-label="Add invoice"
    >
      + Invoice
    </button>
  </Html>
));

const VendorDetail = React.memo(({
  vendor,
  expiringContracts,
  variances,
  onSelectContract,
  onAddInvoice
}: {
  vendor: Vendor,
  expiringContracts: VendorContract[],
  variances: VendorContractVarianceResponse[],
  onSelectContract: (contract: VendorContract) => void,
  onAddInvoice: () => void
}) => {
  const vendorVariances = variances.filter(v => v.vendorId === vendor.id);
  return (
    <group>
      <group position={[-20, 0, 0]}>
        <Html
          transform
          center
          style={{ width: '340px' }}
        >
          <div className="vendor-detail__info">
            <div className="glow-effect glow-effect--primary" />
            <div className="vendor-detail__row">
              <span className="vendor-detail__label">Legal Name:</span>
              <span className="vendor-detail__value">{vendor.legalName}</span>
            </div>
            <div className="vendor-detail__row">
              <span className="vendor-detail__label">Industry:</span>
              <span className="vendor-detail__value">
                {vendor.industryClassification || 'Not specified'}
              </span>
            </div>
            <div className="vendor-detail__row">
              <span className="vendor-detail__label">Market Rate:</span>
              <span className="vendor-detail__value">
                {vendor.marketRateReference || 'Not available'}
              </span>
            </div>
            {vendorVariances.length > 0 && (
              <div className="vendor-detail__row">
                <span className="vendor-detail__label">Avg Variance:</span>
                <span className="vendor-detail__value">
                  {(
                    vendorVariances.reduce((sum, v) => sum + v.variancePercentage, 0) /
                    vendorVariances.length
                  ).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </Html>
      </group>
      <VendorNetworkVisualization
        vendor={vendor}
        contracts={expiringContracts}
        position={[-20, 9, 0]}
      />
      <ExpiringContractList
        contracts={expiringContracts}
        onSelect={onSelectContract}
        onHover={() => {}}
      />
    </group>
  );
});

const ExpiringContractList = React.memo(({
  contracts,
  onSelect,
  onHover
}: {
  contracts: VendorContract[],
  onSelect: (contract: VendorContract) => void,
  onHover: (contract: VendorContract | null) => void
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (listRef.current) {
      listRef.current.scrollTop += e.deltaY;
      e.stopPropagation();
    }
  };

  return (
    <Html
      transform
      center
      position={[-8, 2, 0]}
      style={{
        width: '360px',
          height: '400px',
          overflowY: 'auto',
          border: `solid 2px ${COLORS.PRIMARY}`,
          borderRadius: '8px',
      }}
      onWheel={handleWheel}
    >
      <div ref={listRef} className="contract-list__scroll-container">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="contract-list__item-container"
            onMouseEnter={() => onHover(contract)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="glow-effect glow-effect--primary" />
            <div
              className="contract-list__card"
              onClick={() => onSelect(contract)}
            >
              <div className="contract-list__header">
                <div className="contract-list__service" title={contract.serviceDescription}>
                  {contract.serviceDescription}
                </div>
                <div
                  className="contract-list__status"
                  style={{
                    color: contract.isActive ? COLORS.INCOME : COLORS.EXPENSE
                  }}
                >
                  {contract.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="contract-list__details">
                <div className="contract-list__rate">
                  ${VendorService.parseAmount(contract.contractedRate).toLocaleString()}
                </div>
                <div className="contract-list__dates">
                  {new Date(contract.contractStart).toLocaleDateString()} - {new Date(contract.contractEnd).toLocaleDateString()}
                </div>
              </div>
              <div className="contract-list__expiry-warning">
                Expires in {Math.ceil((new Date(contract.contractEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </div>
            </div>
          </div>
        ))}
      </div>
    </Html>
  );
});

const ContractDetail = React.memo(({
  contract,
  variance,
  onAddInvoice,
  onClose
}: {
  contract: VendorContract,
  variance: VendorContractVarianceResponse | undefined,
  onAddInvoice: () => void,
  onClose: () => void
}) => {
  return (
    <group>
      <group position={[0, 0, 0]}>
        <Html
          transform
          center
          style={{ width: '30vw' }}
        >
          <div className="contract-detail__info">

            <button
              className="contract-detail__close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close contract details"
              style={{
                position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'transparent',
                  border: 'none',
                  color: COLORS.EXPENSE,
                  fontSize: '20px',
                  cursor: 'pointer',
                  zIndex: 10
              }}
            >
              ×
            </button>


            <div className="glow-effect glow-effect--primary" />
            <div className="contract-detail__row">
              <span className="contract-detail__label">Service:</span>
              <span className="contract-detail__value">{contract.serviceDescription}</span>
            </div>
            <div className="contract-detail__row">
              <span className="contract-detail__label">Rate:</span>
              <span className="contract-detail__value">
                ${VendorService.parseAmount(contract.contractedRate).toLocaleString()}
              </span>
            </div>
            {variance && (
              <>
                <div className="contract-detail__row">
                  <span className="contract-detail__label">Market Rate:</span>
                  <span className="contract-detail__value">
                    ${VendorService.parseAmount(variance.marketRate).toLocaleString()}
                  </span>
                </div>
                <div className="contract-detail__row">
                  <span className="contract-detail__label">Variance:</span>
                  <span
                    className="contract-detail__value"
                    style={{
                      color: variance.variancePercentage < 0 ? COLORS.INCOME : COLORS.EXPENSE
                    }}
                  >
                    {variance.variancePercentage > 0 ? '+' : ''}
                    {variance.variancePercentage.toFixed(2)}%
                    (${VendorService.parseAmount(variance.varianceAmount).toLocaleString()})
                  </span>
                </div>
              </>
            )}
            <div className="contract-detail__row">
              <span className="contract-detail__label">Term:</span>
              <span className="contract-detail__value">
                {new Date(contract.contractStart).toLocaleDateString()} - {new Date(contract.contractEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="contract-detail__row">
              <span className="contract-detail__label">Auto-renew:</span>
              <span className="contract-detail__value">
                {contract.autoRenew ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </Html>
      </group>
      <ContractCrystalView
        contract={contract}
        variance={variance}
        position={[4, 0, 0]}
      />
    </group>
  );
});

export default function Vendors({ position }: { position: [number, number, number] }) {
  const [globalVendorsData] = useAtom(vendorsDataAtom);
  const [appLoading] = useAtom(loadingAtom);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<VendorContract[]>([]);
  const [variances, setVariances] = useState<VendorContractVarianceResponse[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedContract, setSelectedContract] = useState<VendorContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (globalVendorsData.length > 0) {
          setVendors(globalVendorsData);

          const [expiringData, variancesData] = await Promise.all([
            VendorService.getExpiringContracts(),
            VendorService.getVarianceAnalysis()
          ]);

          setExpiringContracts(expiringData);
          setVariances(variancesData);
        } else {
          const [vendorsData, expiringData, variancesData] = await Promise.all([
            VendorService.getAllVendors(),
            VendorService.getExpiringContracts(),
            VendorService.getVarianceAnalysis()
          ]);

          setVendors(vendorsData);
          setExpiringContracts(expiringData);
          setVariances(variancesData);
        }
      } catch (error) {
        console.error("Failed to load vendor data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [globalVendorsData]);

  useEffect(() => {
    if (selectedVendor) {
      const matches = expiringContracts.filter(c => c.vendorId === selectedVendor!.id);
      console.log('🔍 Vendor Contracts Found:', matches.length, 'for vendor:', selectedVendor.legalName, 'ID:', selectedVendor.id);
      console.log('📄 All Contracts:', expiringContracts);
    }
  }, [selectedVendor, expiringContracts]);

  const handleAddVendor = async (vendor: CreateVendorRequest) => {
    const newVendor = await VendorService.createVendor(vendor);
    setVendors([...vendors, newVendor]);
    setShowVendorForm(false);
  };

  const handleAddInvoice = async (invoice: CreateVendorInvoiceRequest) => {
    if (!selectedContract) return;
    const newInvoice = await VendorService.createInvoice(selectedContract.id, invoice);
    console.log("Created invoice:", newInvoice);
    setShowInvoiceForm(false);
  };

  if (appLoading) {
    return (
      <group position={position}>
        <Text>Loading application data...</Text>
      </group>
    );
  }

  if (loading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          Loading vendors...
        </Text>
      </group>
    );
  }

  return (
    <group position={position}>
      {showVendorForm && (
        <VendorForm
          position={[0, 0, 0]}
          onSubmit={handleAddVendor}
          onCancel={() => setShowVendorForm(false)}
        />
      )}
      {showInvoiceForm && selectedContract && (
        <VendorInvoiceForm
          position={[0, 0, 0]}
          contractId={selectedContract.id}
          onSubmit={handleAddInvoice}
          onCancel={() => setShowInvoiceForm(false)}
        />
      )}
      {!showVendorForm && !showInvoiceForm && (
        <>
          <group position={[11, -0.41, 0]}>
            <Text
              position={[0, 8, 0]}
              fontSize={0.5}
              color={COLORS.PRIMARY}
              anchorX="center"
              anchorY="middle"
              font="/fonts/orbitron-medium.otf"
              letterSpacing={0.05}
              lineHeight={1}
            >
              VENDOR NETWORK
            </Text>

            <group position={[0, 0, 0]}>

              <VendorList
                vendors={vendors}
                onSelect={setSelectedVendor}
                selectedVendorId={selectedVendor?.id || null}
              />
            </group>

            <group position={[-2, -4.4, 0]}>
              {selectedVendor ? (
                <VendorDetail
                  vendor={selectedVendor}
                  expiringContracts={expiringContracts.filter(c => c.vendorId === selectedVendor.id)}
                  variances={variances}
                  onSelectContract={setSelectedContract}
                  onAddInvoice={() => setShowInvoiceForm(true)}
                />
              ) : (
                <Html
                  transform
                  center
                  style={{ width: '340px' }}
                  position={[-20, 0.2, 0]}
                >
                  <div className="vendors-placeholder">
                    <div className="placeholder-text">
                      Select a vendor to view details
                    </div>
                  </div>
                </Html>
              )}
            </group>
          </group>

          {selectedContract && (
            <ContractDetail
              contract={selectedContract}
              variance={variances.find(v => v.contractId === selectedContract.id)}
              onAddInvoice={() => setShowInvoiceForm(true)}
              onClose={() => setSelectedContract(null)}
            />
          )}

        </>
      )}
    </group>
  );
}
