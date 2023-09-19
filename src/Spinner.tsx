export default function Spinner() {
  return (
    <svg
      version="1.1"
      id="L9"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="40px"
      height="38px"
      viewBox="0 20 50 100"
      enableBackground="new 0 0 0 0"
      xmlSpace="preserve"
      className="inline-block"
    >
      <rect x="20" y="50" width="4" height="10" fill="rgb(245 158 11)">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0"
          dur="0.6s"
          repeatCount="indefinite"
        ></animateTransform>
      </rect>
      <rect x="30" y="50" width="4" height="10" fill="rgb(245 158 11)">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.2s"
          dur="0.6s"
          repeatCount="indefinite"
        ></animateTransform>
      </rect>
      <rect x="40" y="50" width="4" height="10" fill="rgb(245 158 11)">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.4s"
          dur="0.6s"
          repeatCount="indefinite"
        ></animateTransform>
      </rect>
    </svg>
  );
}
